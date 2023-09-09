//! Tauri IPC commands to bridge System Frontend Model Controller to Backend Model Controller
//!

use super::{CreateParams, DeleteParams, GetParams, IpcResponse, ListParams, UpdateParams};
use crate::ctx::Ctx;
use crate::model::{
	ModelMutateResultData, System, SystemBmc, SystemForCreate, SystemForUpdate,
};
use crate::Error;
use serde_json::Value;
use tauri::{command, AppHandle, Wry};

#[command]
pub async fn get_system(app: AppHandle<Wry>, params: GetParams) -> IpcResponse<System> {
	match Ctx::from_app(app) {
		Ok(ctx) => SystemBmc::get(ctx, &params.id).await.into(),
		Err(_) => Err(Error::CtxFail).into(),
	}
}

#[command]
pub async fn create_system(
	app: AppHandle<Wry>,
	params: CreateParams<SystemForCreate>,
) -> IpcResponse<ModelMutateResultData> {
	match Ctx::from_app(app) {
		Ok(ctx) => SystemBmc::create(ctx, params.data).await.into(),
		Err(_) => Err(Error::CtxFail).into(),
	}
}

#[command]
pub async fn update_system(
	app: AppHandle<Wry>,
	params: UpdateParams<SystemForUpdate>,
) -> IpcResponse<ModelMutateResultData> {
	match Ctx::from_app(app) {
		Ok(ctx) => SystemBmc::update(ctx, &params.id, params.data)
			.await
			.into(),
		Err(_) => Err(Error::CtxFail).into(),
	}
}

#[command]
pub async fn delete_system(
	app: AppHandle<Wry>,
	params: DeleteParams,
) -> IpcResponse<ModelMutateResultData> {
	match Ctx::from_app(app) {
		Ok(ctx) => SystemBmc::delete(ctx, &params.id).await.into(),
		Err(_) => Err(Error::CtxFail).into(),
	}
}

#[command]
pub async fn list_systems(
	app: AppHandle<Wry>,
	params: ListParams<Value>,
) -> IpcResponse<Vec<System>> {
	match Ctx::from_app(app) {
		Ok(ctx) => match params.filter.map(serde_json::from_value).transpose() {
			Ok(filter) => SystemBmc::list(ctx, filter).await.into(),
			Err(err) => Err(Error::JsonSerde(err)).into(),
		},
		Err(_) => Err(Error::CtxFail).into(),
	}
}
