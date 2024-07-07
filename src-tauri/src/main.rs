#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod consts;
pub mod discord;

use discord::{AssetImage, MessageType};

use discord::{thread_discord_rp, Message};
use std::{
    sync::mpsc::{self, Sender},
    thread,
};
use tauri::{generate_handler, State};

struct PreludeState(Sender<Message>);

#[tauri::command]
fn rpc_update(
    _state: State<PreludeState>,
    state: &str,
    details: &str,
    large_image: Option<AssetImage>,
    small_image: Option<AssetImage>,
) {
    let tx: &Sender<Message> = &_state.0;

    if let Err(err) = tx.send(Message::new(
        MessageType::IpcUpdate,
        discord::IpcUpdatePacket {
            state: state.to_string(),
            details: details.to_string(),
            large_image,
            small_image
        },
    )) {
        println!("ipc: error whilst updating ipc: {}", err);
    };
}

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        thread_discord_rp(rx);
    });

    tx.send(Message {
        _type: MessageType::IpcConnect,
        _data: None,
    })
    .expect("unable to connect to ipc");

    tauri::Builder::default()
        .manage(PreludeState(tx))
        .invoke_handler(generate_handler![rpc_update])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
