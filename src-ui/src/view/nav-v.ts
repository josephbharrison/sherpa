import { DInputElement } from '@dom-native/ui';
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
    scanChild,
} from 'dom-native';
import { System } from '../bindings/System.js';
import { systemFmc } from '../model/index.js';
import { router } from '../router.js';

const HTML = html`
    <header>
        <label>Systems</label>
        <d-ico class="action show-add-system" name="ico-add"></d-ico>
    </header>
    <section></section>
`;

@customElement('nav-v')
export class NavView extends BaseHTMLElement {
    // extends HTMLElement
    // #region    --- Key Els
    #headerEl!: HTMLElement;
    #contentEl!: HTMLElement;
    // #endregion --- Key Els

    // #region    --- App Events
    @onHub('Model', 'system', 'create')
    async onSystemCreate(data: any) {
        this.refreshContent();
        router.update_state({
            system_id: data.id,
        });
    }

    @onHub('Route', 'change')
    onRouteChange() {
        this.updateContentSel();
    }
    // #endregion --- App Events

    // #region    --- UI Events
    @onEvent('pointerdown', 'header > .show-add-system')
    onShowAddSystem() {
        let inputEl = first(this.#headerEl, 'system-new-ipt');

        // if already showing, we toggle it off (cancel)
        if (inputEl != null) {
            inputEl.remove();
            return;
        }
        // otherwise, we add the d-input
        else {
            const inputEl = this.#headerEl.appendChild(elem('system-new-ipt'))!;
            inputEl.focus();
            on(
                inputEl,
                'CHANGE',
                (evt: OnEvent<{ name: string | null; value: string }>) => {
                    const val = evt.detail.value;
                    if (val.length > 0) {
                        systemFmc.create({ name: val });
                        inputEl.clear(); // this will triggern a CHANGE with value ""
                    } else {
                        inputEl.remove();
                    }
                },
            );
        }
    }

    @onEvent('pointerdown', 'section > a')
    selNav(evt: Event & OnEvent) {
        const system_id = evt.selectTarget.getAttribute('data-id')!;

        router.update_state({ system_id });
    }
    // #endregion --- UI Events

    init() {
        const content = document.importNode(HTML, true);
        [this.#headerEl, this.#contentEl] = scanChild(
            content,
            'header',
            'section',
        );

        this.replaceChildren(content);

        this.refreshContent(true);
    }

    async refreshContent(first_refresh?: boolean) {
        const systems = await systemFmc.list();

        // Create the content DocumentFragment from the systems and replace children
        const content = frag(systems, (prj: System) =>
            elem('a', { 'data-id': prj.id, $: { textContent: prj.name } }),
        );
        this.#contentEl.replaceChildren(content);

        // Update selction
        this.updateContentSel();

        // If first refresh, select first system (update router)
        if (first_refresh && systems.length > 0) {
            router.update_state({ system_id: systems[0].id });
        }
    }

    updateContentSel() {
        let { system_id } = router.get_current();
        all(this, `section > a.sel`).forEach((el) =>
            el.classList.remove('sel'),
        );
        if (system_id != null) {
            const el = first(`section > a[data-id="${system_id}"]`);
            el?.classList.add('sel');
        }
    }
}
declare global {
    interface HTMLElementTagNameMap {
        'nav-v': NavView;
    }
}

@customElement('system-new-ipt')
class SystemNewInput extends BaseHTMLElement {
    // extends HTMLElement
    // #region    --- Key Els
    #d_input!: DInputElement;
    // #endregion --- Key Els

    // #region    --- UI Events
    // Note: here we need keydown and preventDefault if we want to avoid the "ding" sound.
    @onEvent('keydown')
    onExecKey(evt: KeyboardEvent) {
        if (evt.key == 'Escape') {
            // we cancel
            this.remove();
            evt.preventDefault();
        }
    }
    // #endregion --- UI Events

    init() {
        this.#d_input = elem('d-input', {
            placeholder: 'System name (press Enter)',
        });
        this.replaceChildren(this.#d_input);
    }

    focus() {
        // Note: This is a little trick to make sure the focus command does not get loss
        requestAnimationFrame(() => {
            this.#d_input.focus();
        });
    }

    clear() {
        this.#d_input.value = '';
    }
}
declare global {
    interface HTMLElementTagNameMap {
        'system-new-ipt': SystemNewInput;
    }
}
