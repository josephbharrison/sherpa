# SHERPA

Space Hauler's EVE Route Planner Application (SHERPA).

Base desktop application code with Tauri, Native Web Components, and SurrealDB (follow the VMES app architecture)

> Note: To enable persitent storage (currently disabled), edit the `src-tauri/Cargo.toml` to enable all `surrealdb` features. 

## Development Prerequisites:

- rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- awesome-app: `cargo install awesome-app` (tauri MVC boiler plate)

## Hot Reload dev

For hot-reload UI and Tauri development, run the following in your terminal.

```sh
awesome-app dev
```

> This assumes `awesome-app` was installed locally (e.g., `cargo install awesome-app`)

> **IMPORTANT** - Requires **node.js v8 and above**. 


## Build manually

IMPORTANT: Make sure to have **node.js latest of 16** or above. 

- `npm run tauri icon src-tauri/icons/app-icon.png` - This will build the application icons. 

- `npm run pcss` - This will build the postcss files (`src-ui/pcss/**/*.pcss`).

- `npm run rollup` - This will build and package the typescript files (`src-ui/src/**/*.ts`).

- `npm run localhost` - This will run a localhost server with the `dist/` folder as root (frontend hot reload)

- In another terminal, `npm run tauri dev` - Will start the Tauri build and start the process.

<br />

## Troubleshooting

- Make sure to have **node.js 18** or above.

- If some cryptic errors, run the command above one by one. 

- If `npm tauri dev` commands fail, try to do:
  - `cd src-tauri`
  - `cargo build` 
  - This might be an important first step when using full surrealdb (i.e., with default features and not only kv-mem) 
  
- It failed to compile and came up with the error `failed to download replaced source registry crates-io`. **Deleting** the **cargo.lock** file and **package-lock.json** file fixed it.  

- Installing Tauri in case some issues: 
```sh
# install latest tauri in case there is none
npm i -g @tauri-apps/cli @tauri-apps/api
```
