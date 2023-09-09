import { DCheckElement } from '@dom-native/ui';
import {
    all,
    BaseHTMLElement,
    customElement,
    elem,
    first,
    frag,
    html,
    on,
    OnEvent,
    onEvent,
    onHub,
    position,
    scanChild,
    trigger,
} from 'dom-native';
import { ModelMutateResultData, Station } from '../bindings/index.js';
import { stationFmc } from '../model/index.js';
import { classable } from '../utils.js';

const TASK_HEADER = html`
    <div class="th">Title</div>
    <div class="th">Info</div>
    <div class="th visible">Visible</div>
    <div class="th more">&nbsp;</div>
`;

const TASK_ROW_HTML = html`
    <span class="title"></span>
    <span class="info"></span>
    <d-check class="visible"></d-check>
    <d-ico class="show-more" name="ico-more"></d-ico>
`;

@customElement('stations-dt')
export class StationsDataTable extends BaseHTMLElement {
    // extends HTMLElement
    // #region    --- Data
    #system_id!: string;
    set system_id(v: string) {
        this.#system_id = v;
        this.update();
    }

    #filter?: any;
    set filter(f: any) {
        this.#filter = f;
        this.update();
    }
    // #endregion --- Data

    // #region    --- App Event
    // Create will refresh the full datagrid, in case of sort by name and such
    @onHub('Model', 'station', 'create')
    onStationCreate() {
        this.update();
    }

    // Delete can be more selective in this case, will delete the row
    @onHub('Model', 'station', 'delete')
    onStationDelete(data: ModelMutateResultData) {
        all(this, `station-row.${classable(data.id)}`).forEach(
            (stationRowEl) => {
                // Note: This will add the class in the stationRow, but the animations are on the cells
                //       as the station-row as the display: contents in the css
                //       (to be transparent to the grid layout, hence, can't style it)
                stationRowEl.classList.add('anim-delete');

                // Note: Trick to start the dom deletion before the animation terminate to make it snapier
                setTimeout(() => {
                    stationRowEl.remove();
                }, 100);

                // Note: This is sementically correct way to delete it, on first transition end.
                // stationRowEl.addEventListener('transitionend', (evt) => {
                //   // Note: Here we will get many events back (one per animated element and property)
                //   //       So, just delete on first.
                //   if (stationRowEl.isConnected) {
                //     stationRowEl.remove()
                //   }
                // });
            },
        );
    }

    @onHub('Model', 'station', 'update')
    async onStationUpdate(data: ModelMutateResultData) {
        const newStation = await stationFmc.get(data.id);
        all(this, `station-row.${classable(data.id)}`).forEach(
            (stationEl) => ((<StationRow>stationEl).station = newStation),
        );
    }
    // #endregion --- App Event

    // #region    --- UI Events
    @onEvent('pointerup', 'station-row .show-more')
    onStationShowMore(evt: OnEvent) {
        const MENU_CLASS = 'station-row-more-menu';

        // if already showing (will auto remove, but we do not want to popup it again)
        if (first(`body > menu-c.${MENU_CLASS}`)) return;

        const showMoreEl = evt.selectTarget;
        const station = showMoreEl.closest('station-row')!.station;

        const options = {
            toggle: station.visible ? 'Mark Invisible' : 'Mark Visible',
            delete: elem('label', {
                class: 'delete',
                $: { textContent: 'Delete' },
            }),
        };

        // Show the meunu
        const menuEl = elem('menu-c', { class: MENU_CLASS, $: { options } });
        document.body.appendChild(menuEl);
        on(menuEl, 'SELECT', (evt: OnEvent<keyof typeof options>) => {
            if (evt.detail == 'delete') {
                stationFmc.delete(station.id);
            } else if (evt.detail == 'toggle') {
                stationFmc.update(station.id, { visible: !station.visible });
            }
        });
        position(menuEl, showMoreEl, { refPos: 'BR', pos: 'BL', gap: 4 });
    }

    @onEvent('CHANGE', 'station-row d-check')
    onStationCheckClick(evt: OnEvent<{ value: boolean }>) {
        let stationEl = evt.selectTarget.closest('station-row')!;
        let station_id = stationEl.station.id;
        let newVisible = evt.detail.value;

        // Make sure to avoid infine loop
        // (will get this event when changed by other mean as well)
        if (newVisible !== stationEl.station.visible) {
            stationFmc.update(station_id, { visible: evt.detail.value });
        }
    }
    // #endregion --- UI Events

    postDisplay() {
        this.update();
    }

    async update() {
        if (this.initialized) {
            const filter = {
                system_id: this.#system_id,
                ...this.#filter,
            };
            const stations = await stationFmc.list(filter);

            const content = frag(stations, (station) =>
                elem('station-row', { $: { station } }),
            );

            content.prepend(document.importNode(TASK_HEADER, true));

            this.replaceChildren(content);

            if (stations.length == 0) {
                trigger(this, 'EMPTY');
            }
        }
    }
}
declare global {
    interface HTMLElementTagNameMap {
        'stations-dt': StationsDataTable;
    }
}

// #region    --- station-row
@customElement('station-row')
export class StationRow extends BaseHTMLElement {
    // extends HTMLElement
    // #region    --- Data
    #station!: Station;
    set station(newStation: Station) {
        const oldStation = this.#station as Station | undefined;
        if (oldStation !== newStation) {
            this.#station = newStation;
            this.update(newStation, oldStation);
        }
    }
    get station() {
        return this.#station;
    }
    // #endregion --- Data

    // #region    --- Key Els
    #checkEl!: DCheckElement;
    #titleEl!: HTMLElement;
    #infoEl!: HTMLElement;
    // #endregion --- Key Els

    init() {
        super.init();
        let content = document.importNode(TASK_ROW_HTML, true);
        // Note: dom-native scanChild is a strict one fast pass child scanner.
        //       Use all/first if needs to be more flexible.
        [this.#titleEl, this.#infoEl, this.#checkEl] = scanChild(
            content,
            'span',
            'span',
            'd-check',
        );

        // FIXME: Check that order does not matter here.
        this.replaceChildren(content);
        this.update(this.#station);
    }

    update(newStation: Station, oldStation?: Station) {
        if (oldStation) {
            this.classList.remove(`${classable(oldStation.id)}`);
        }

        // if ready to be injected, we do the job
        if (newStation && this.#titleEl != null) {
            this.classList.add(`${classable(newStation.id)}`);
            this.#checkEl.checked = newStation.visible;

            this.#titleEl.textContent = newStation.title;
            let info = newStation.ctime;
            info = info.substring(info.length - 5);
            this.#infoEl.textContent = `(ctime: ${info})`;
        }
    }
}
declare global {
    interface HTMLElementTagNameMap {
        'station-row': StationRow;
    }
}
// #endregion --- station-row
