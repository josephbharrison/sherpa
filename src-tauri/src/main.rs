// #![allow(unused)]

#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

// -- Re-Exports
pub use error::{Error, Result};

// -- Imports
use model::{seed_store_for_dev, ModelStore};
use std::sync::Arc;

// -- Sub-Modules
mod ctx;
mod error;
mod event;
mod ipc;
mod model;
mod prelude;
mod utils;

#[tokio::main]
async fn main() -> Result<()> {
	let model_manager = ModelStore::new().await?;
	let model_manager = Arc::new(model_manager);

	// for dev only
	seed_store_for_dev(model_manager.clone()).await?;

	tauri::Builder::default()
		.manage(model_manager)
		.invoke_handler(tauri::generate_handler![
			// System
			ipc::get_system,
			ipc::create_system,
			ipc::update_system,
			ipc::delete_system,
			ipc::list_systems,
			// Station
			ipc::get_station,
			ipc::create_station,
			ipc::update_station,
			ipc::delete_station,
			ipc::list_stations,
		])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");

	Ok(())
}
