import { pruneEmpty } from 'utils-min';
import {
    ModelMutateResultData,
    System,
    SystemForCreate,
    SystemForUpdate,
    Station,
    StationForCreate,
    StationForUpdate,
} from '../bindings/index.js';
import { ensure_ModelMutateResultData } from '../bindings/type_asserts.js';
import { ipc_invoke } from '../ipc.js';

/**
 * Base Frontend Model Controller class with basic CRUD except `list` which will be per subclass for now.
 *
 * - M - For the Enity model type (e.g., System)
 * - C - For the Create data type (e.g., SystemForCreate)
 * - U - For the update data type (e.g., SystemForUpdate)
 */
class BaseFmc<M, C, U> {
    #cmd_suffix: string;
    get cmd_suffix() {
        return this.#cmd_suffix;
    }

    constructor(cmd_suffix: string) {
        this.#cmd_suffix = cmd_suffix;
    }

    async get(id: string): Promise<M> {
        return ipc_invoke(`get_${this.#cmd_suffix}`, { id }).then(
            (res) => res.data,
        );
    }

    async create(data: C): Promise<ModelMutateResultData> {
        return ipc_invoke(`create_${this.#cmd_suffix}`, { data }).then(
            (res) => {
                return ensure_ModelMutateResultData(res.data);
            },
        );
    }

    async update(id: string, data: U): Promise<ModelMutateResultData> {
        return ipc_invoke(`update_${this.#cmd_suffix}`, { id, data }).then(
            (res) => {
                return ensure_ModelMutateResultData(res.data);
            },
        );
    }

    async delete(id: string): Promise<ModelMutateResultData> {
        return ipc_invoke(`delete_${this.#cmd_suffix}`, { id }).then(
            (res) => res.data,
        );
    }
}

// #region    --- SystemFmc
class SystemFmc extends BaseFmc<System, SystemForCreate, SystemForUpdate> {
    constructor() {
        super('system');
    }

    async list(): Promise<System[]> {
        // Note: for now, we just add a 's' for list, might might get rid of plurals
        return ipc_invoke(`list_${this.cmd_suffix}s`, {}).then(
            (res) => res.data,
        );
    }
}
export const systemFmc = new SystemFmc();
// #endregion --- SystemFmc

// #region    --- StationBmc
class StationFmc extends BaseFmc<Station, StationForCreate, StationForUpdate> {
    constructor() {
        super('station');
    }

    async list(filter: any): Promise<System[]> {
        // prune the empty string so that the UI does not have to do too much.
        filter = pruneEmpty(filter);
        // Note: for now, we just add a 's' for list, might might get rid of plurals
        return ipc_invoke(`list_${this.cmd_suffix}s`, { filter }).then(
            (res) => res.data,
        );
    }
}
export const stationFmc = new StationFmc();

// #endregion --- StationBmc
