// ipc/station.rs
//
//! Tauri IPC commands to bridge Station Frontend Model Controller to Backend Model Controller
//!

use crate::ctx::Ctx;
use crate::ipc::{CreateParams, DeleteParams, GetParams, IpcResponse, ListParams, UpdateParams};
use crate::model::{
	ModelMutateResultData, Station, StationBmc, StationForCreate, StationForUpdate,
};
use crate::Error;
use serde_json::Value;
use tauri::{command, AppHandle, Wry};

#[command]
pub async fn get_station(app: AppHandle<Wry>, params: GetParams) -> IpcResponse<Station> {
	match Ctx::from_app(app) {
		Ok(ctx) => StationBmc::get(ctx, &params.id).await.into(),
		Err(_) => Err(Error::CtxFail).into(),
	}
}

#[command]
pub async fn create_station(
	app: AppHandle<Wry>,
	params: CreateParams<StationForCreate>,
) -> IpcResponse<ModelMutateResultData> {
	match Ctx::from_app(app) {
		Ok(ctx) => StationBmc::create(ctx, params.data).await.into(),
		Err(_) => Err(Error::CtxFail).into(),
	}
}

#[command]
pub async fn update_station(
	app: AppHandle<Wry>,
	params: UpdateParams<StationForUpdate>,
) -> IpcResponse<ModelMutateResultData> {
	match Ctx::from_app(app) {
		Ok(ctx) => StationBmc::update(ctx, &params.id, params.data)
			.await
			.into(),
		Err(_) => Err(Error::CtxFail).into(),
	}
}

#[command]
pub async fn delete_station(
	app: AppHandle<Wry>,
	params: DeleteParams,
) -> IpcResponse<ModelMutateResultData> {
	match Ctx::from_app(app) {
		Ok(ctx) => StationBmc::delete(ctx, &params.id).await.into(),
		Err(_) => Err(Error::CtxFail).into(),
	}
}

#[command]
pub async fn list_stations(
	app: AppHandle<Wry>,
	params: ListParams<Value>,
) -> IpcResponse<Vec<Station>> {
	// TODO: Needs to make error handling simpler (use ? rather than all into())
	match Ctx::from_app(app) {
		Ok(ctx) => match params.filter.map(serde_json::from_value).transpose() {
			Ok(filter) => StationBmc::list(ctx, filter).await.into(),
			Err(err) => Err(Error::JsonSerde(err)).into(),
		},
		Err(_) => Err(Error::CtxFail).into(),
	}
}
