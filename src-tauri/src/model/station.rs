// model/station.rs
//
//! All model and controller for the Item type
//!

use super::bmc_base::{bmc_create, bmc_delete, bmc_get, bmc_list, bmc_update};
use super::store::{Creatable, Filterable, Patchable};
use super::ModelMutateResultData;
use crate::ctx::Ctx;
use crate::utils::{map, XTake};
use crate::{Error, Result};
use modql::filter::{FilterNodes, OpValsString};
use modql::ListOptions;
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use std::collections::BTreeMap;
use std::sync::Arc;
use surrealdb::sql::{Object, Value};
use ts_rs::TS;

// region:    --- Station

#[skip_serializing_none]
#[derive(Serialize, TS, Debug)]
#[ts(export, export_to = "../src-ui/src/bindings/")]
pub struct Station {
	pub id: String,
	pub ctime: String,
	pub system_id: String,

	pub visible: bool,
	pub title: String,
	pub desc: Option<String>,
}

impl TryFrom<Object> for Station {
	type Error = Error;
	fn try_from(mut val: Object) -> Result<Station> {
		let station = Station {
			id: val.x_take_val("id")?,
			ctime: val.x_take_val::<i64>("ctime")?.to_string(),
			system_id: val.x_take_val("system_id")?,
			visible: val.x_take_val("visible")?,
			title: val.x_take_val("title")?,
			desc: val.x_take("desc")?,
		};

		Ok(station)
	}
}

// endregion: --- Station

// region:    --- StationForCreate

#[skip_serializing_none]
#[derive(Deserialize, TS, Debug)]
#[ts(export, export_to = "../src-ui/src/bindings/")]
pub struct StationForCreate {
	pub system_id: String,
	pub title: String,
	pub visible: Option<bool>,
	pub desc: Option<String>,
}

impl From<StationForCreate> for Value {
	fn from(val: StationForCreate) -> Self {
		let mut data = map![
			"system_id".into() => val.system_id.into(),
			"title".into() => val.title.into(),
		];

		// default for visible is true
		data.insert("visible".into(), val.visible.unwrap_or(true).into());

		if let Some(desc) = val.desc {
			data.insert("desc".into(), desc.into());
		}
		Value::Object(data.into())
	}
}

impl Creatable for StationForCreate {}

// endregion: --- StationForCreate

// region:    --- StationForUpdate

#[skip_serializing_none]
#[derive(Deserialize, TS, Debug)]
#[ts(export, export_to = "../src-ui/src/bindings/")]
pub struct StationForUpdate {
	pub title: Option<String>,
	pub visible: Option<bool>,
	pub desc: Option<String>,
}

impl From<StationForUpdate> for Value {
	fn from(val: StationForUpdate) -> Self {
		let mut data = BTreeMap::new();
		if let Some(title) = val.title {
			data.insert("title".into(), title.into());
		}
		if let Some(visible) = val.visible {
			data.insert("visible".into(), visible.into());
		}
		if let Some(desc) = val.desc {
			data.insert("desc".into(), desc.into());
		}
		Value::Object(data.into())
	}
}

impl Patchable for StationForUpdate {}

// endregion: --- StationForUpdate

// region:    --- StationFilter

#[derive(FilterNodes, Deserialize, Debug)]
pub struct StationFilter {
	pub system_id: Option<OpValsString>,
	pub title: Option<OpValsString>,
}

impl Filterable for StationFilter {}

// endregion: --- StationFilter

// region:    --- StationBmc

pub struct StationBmc;

impl StationBmc {
	const ENTITY: &'static str = "station";

	pub async fn get(ctx: Arc<Ctx>, id: &str) -> Result<Station> {
		bmc_get::<Station>(ctx, Self::ENTITY, id).await
	}

	pub async fn create(ctx: Arc<Ctx>, data: StationForCreate) -> Result<ModelMutateResultData> {
		bmc_create(ctx, Self::ENTITY, data).await
	}

	pub async fn update(
		ctx: Arc<Ctx>,
		id: &str,
		data: StationForUpdate,
	) -> Result<ModelMutateResultData> {
		bmc_update(ctx, Self::ENTITY, id, data).await
	}

	pub async fn delete(ctx: Arc<Ctx>, id: &str) -> Result<ModelMutateResultData> {
		bmc_delete(ctx, Self::ENTITY, id).await
	}

	pub async fn list(ctx: Arc<Ctx>, filter: Option<StationFilter>) -> Result<Vec<Station>> {
		let opts = ListOptions {
			limit: None,
			offset: None,
			order_bys: Some("!ctime".into()),
		};
		bmc_list(ctx, Self::ENTITY, filter, opts).await
	}
}

// endregion: --- StationBmc
