// server/auth.rs
//
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::Deserialize;

#[derive(Deserialize)]
struct AuthCallbackInfo {
    jwt: String,
}

async fn auth_callback(info: web::Query<AuthCallbackInfo>) -> impl Responder {
    println!("JWT: {}", info.jwt);
    HttpResponse::Ok().body("Callback received")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().route("/auth_callback", web::get().to(auth_callback))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

