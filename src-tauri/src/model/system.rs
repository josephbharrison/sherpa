// model/system.rs
//
//! All model and controller for the System type
//!
use super::bmc_base::{bmc_create, bmc_delete, bmc_get, bmc_list, bmc_update};
use super::store::{Creatable, Filterable, Patchable};
use super::ModelMutateResultData;
use crate::ctx::Ctx;
use crate::utils::XTake;
use crate::{Error, Result};
use modql::filter::{FilterNodes, OpValsString};
use modql::ListOptions;
use serde::{Deserialize, Serialize};
use serde_with_macros::skip_serializing_none;
use std::collections::BTreeMap;
use std::sync::Arc;
use surrealdb::sql::{Object, Value};
use ts_rs::TS;

// region:    --- System

#[derive(Serialize, TS, Debug)]
#[ts(export, export_to = "../src-ui/src/bindings/")]
pub struct System {
	pub id: String,
	pub name: String,
	pub ctime: String,
}

impl TryFrom<Object> for System {
	type Error = Error;
	fn try_from(mut val: Object) -> Result<System> {
		let system = System {
			id: val.x_take_val("id")?,
			name: val.x_take_val("name")?,
			ctime: val.x_take_val::<i64>("ctime")?.to_string(),
		};

		Ok(system)
	}
}

// endregion: --- System

// region:    --- SystemForCreate

#[skip_serializing_none]
#[derive(Deserialize, TS, Debug)]
#[ts(export, export_to = "../src-ui/src/bindings/")]
pub struct SystemForCreate {
	pub name: String,
}

impl From<SystemForCreate> for Value {
	fn from(val: SystemForCreate) -> Self {
		BTreeMap::from([
			// Note: could have used map![.. => ..] as well
			("name".into(), val.name.into()),
		])
		.into()
	}
}

impl Creatable for SystemForCreate {}

// endregion: --- SystemForCreate

// region:    --- SystemForUpdate

#[skip_serializing_none]
#[derive(Deserialize, TS, Debug)]
#[ts(export, export_to = "../src-ui/src/bindings/")]
pub struct SystemForUpdate {
	pub name: Option<String>,
}

impl From<SystemForUpdate> for Value {
	fn from(val: SystemForUpdate) -> Self {
		let mut data = BTreeMap::new();
		if let Some(name) = val.name {
			data.insert("name".into(), name.into());
		}
		data.into()
	}
}

impl Patchable for SystemForUpdate {}

// endregion: --- SystemForUpdate

// region:    --- SystemFilter

#[derive(FilterNodes, Deserialize, Debug)]
pub struct SystemFilter {
	pub id: Option<OpValsString>,
	pub name: Option<OpValsString>,
}

impl Filterable for SystemFilter {}

// endregion: --- SystemFilter

// region:    --- SystemBmc

pub struct SystemBmc;

impl SystemBmc {
	const ENTITY: &'static str = "system";

	pub async fn get(ctx: Arc<Ctx>, id: &str) -> Result<System> {
		bmc_get(ctx, Self::ENTITY, id).await
	}

	pub async fn create(ctx: Arc<Ctx>, data: SystemForCreate) -> Result<ModelMutateResultData> {
		bmc_create(ctx, Self::ENTITY, data).await
	}

	pub async fn update(
		ctx: Arc<Ctx>,
		id: &str,
		data: SystemForUpdate,
	) -> Result<ModelMutateResultData> {
		bmc_update(ctx, Self::ENTITY, id, data).await
	}

	pub async fn delete(ctx: Arc<Ctx>, id: &str) -> Result<ModelMutateResultData> {
		bmc_delete(ctx, Self::ENTITY, id).await
	}

	pub async fn list(ctx: Arc<Ctx>, filter: Option<SystemFilter>) -> Result<Vec<System>> {
		bmc_list(ctx, Self::ENTITY, filter, ListOptions::default()).await
	}
}

// endregion: --- SystemBmc
