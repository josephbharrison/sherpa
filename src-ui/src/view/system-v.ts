import { DInputElement } from '@dom-native/ui';
import {
    BaseHTMLElement,
    customElement,
    elem,
    getFirst,
    html,
    onEvent,
    OnEvent,
} from 'dom-native';
import { System } from '../bindings/index.js';
import { stationFmc } from '../model/index.js';

const HTML = html`
    <header>
        <h1></h1>
        <d-input
            class="new-station"
            placeholder="Add Station (ENTER)"
        ></d-input>
    </header>
    <d-input class="search-station" placeholder="Search Star System"></d-input>
    <section></section>
`;

@customElement('system-v')
export class SystemView extends BaseHTMLElement {
    // extends HTMLElement
    // #region    --- Data
    #system!: System;
    set system(p: System) {
        this.#system = p;
        this.update();
    }
    // #endregion --- Data

    // #region    --- Key Els
    #titleEl!: HTMLElement;
    #contentEl!: HTMLElement;
    #newStationDInputEl!: DInputElement;
    #searchStationDInputEl!: DInputElement;
    // #endregion --- Key Els

    // #region    --- UI Events
    @onEvent('CHANGE', 'd-input.new-station')
    onNewStationInput(evt: OnEvent) {
        let title = (<DInputElement>evt.selectTarget).value.trim();
        if (title.length > 0) {
            // Create the station
            const system_id = this.#system.id;
            stationFmc.create({ system_id, title });

            // Clear the input
            // Note: Here we could also do an await on create, before clearing the input.
            //       Or listening the create event back on station (which is debetable).
            this.#newStationDInputEl.value = '';
        }
    }

    @onEvent('CHANGE', 'd-input.search-station')
    onSearchChange(evt: OnEvent) {
        let search = (<DInputElement>evt.selectTarget).value.trim() as string;
        if (search.length > 0) {
            this.update({ title: { $contains: search } });
        } else {
            this.update();
        }
    }

    @onEvent('EMPTY', 'stations-dt')
    onStationsIsEmpty() {
        this.#newStationDInputEl.focus();
    }
    // #endregion --- UI Events

    init() {
        const content = document.importNode(HTML, true);

        [
            this.#titleEl,
            this.#contentEl,
            this.#newStationDInputEl,
            this.#searchStationDInputEl,
        ] = getFirst(
            content,
            'h1',
            'section',
            'd-input.new-station',
            'd-input.search-station',
        ) as [HTMLHeadingElement, HTMLElement, DInputElement, DInputElement];

        this.replaceChildren(content);

        this.update();
    }

    async update(filter?: any) {
        if (this.#contentEl && this.#titleEl) {
            this.#titleEl.textContent = this.#system.name;

            const stationDt = elem('stations-dt', {
                $: { system_id: this.#system.id, filter },
            });
            this.#contentEl.replaceChildren(stationDt);
        }
    }
}
declare global {
    interface HTMLElementTagNameMap {
        'system-v': SystemView;
    }
}
