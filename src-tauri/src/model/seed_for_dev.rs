use crate::model::{SystemForCreate, StationForCreate};
use crate::Result;
use std::sync::Arc;

use super::ModelStore;

/// Only use while developing. Convenient when to seed the store on start of the application.
pub async fn seed_store_for_dev(model_manager: Arc<ModelStore>) -> Result<()> {
	let ps = ["A", "B"].into_iter().map(|k| {
		(
			k,
			SystemForCreate {
				name: format!("System {k}"),
			},
		)
	});

	for (k, system) in ps {
		let system_id = model_manager
			.store()
			.exec_create::<SystemForCreate>("system", system)
			.await?;

		for i in 1..=200 {
			let visible = i % 2 == 0;
			let station = StationForCreate {
				system_id: system_id.clone(),
				title: format!("Station {k}.{i}"),
				desc: None,
				visible: Some(visible),
			};

			model_manager
				.store()
				.exec_create::<StationForCreate>("station", station)
				.await?;
		}
	}

	Ok(())
}
