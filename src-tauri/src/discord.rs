use discord_rich_presence::{
    activity::{self, Activity, Assets},
    DiscordIpc, DiscordIpcClient,
};
use std::sync::mpsc::Receiver;

use crate::consts::DISCORD_ID;

pub enum MessageType {
    IpcUpdate,
    IpcConnect,
    IpcDisconnect,
}

pub struct IpcUpdatePacket {
    pub(crate) state: String,
    pub(crate) details: String,
    pub(crate) large_image: Option<AssetImage>,
    pub(crate) small_image: Option<AssetImage>,
}

pub struct Message {
    pub(crate) _type: MessageType,
    pub(crate) _data: Option<IpcUpdatePacket>,
}

#[derive(serde::Deserialize, Debug)]
pub struct AssetImage {
    pub(crate) key: String,
    pub(crate) label: String,
}

impl Message {
    pub fn new(_type: MessageType, _data: IpcUpdatePacket) -> Message {
        Message {
            _type,
            _data: Some(_data),
        }
    }
}

pub fn thread_discord_rp(rx: Receiver<Message>) {
    let mut client: DiscordIpcClient =
        DiscordIpcClient::new(DISCORD_ID).expect("unable to create discord ipc client");

    for received in rx {
        match received._type {
            MessageType::IpcConnect => {
                println!("ipc: connecting to discord");

                if let Err(err) = client.connect() {
                    println!("ipc: error whilst connecting: {}", err)
                }
            }
            MessageType::IpcUpdate => {
                let packet: IpcUpdatePacket = received._data.unwrap();
                let activity = Activity::new()
                    .state(&packet.state)
                    .details(&packet.details);

                let large_image = packet.large_image.unwrap_or(AssetImage {
                    key: "".to_owned(),
                    label: "".to_owned()
                });

                let small_image = packet.small_image.unwrap_or(AssetImage {
                    key: "".to_owned(),
                    label: "".to_owned()
                });

                let assets: Assets = Assets::new()
                    .large_image(&large_image.key)
                    .large_text(&large_image.label)
                    .small_image(&small_image.key)
                    .small_text(&small_image.label);


                println!("ipc: updating ipc presence");

                if let Err(err) = client.set_activity(activity.assets(assets)) {
                    println!("ipc: error whilst updating presence: {}", err)
                }
            }
            MessageType::IpcDisconnect => {
                println!("ipc: disconnecting from discord");
                if let Err(err) = client.close() {
                    println!("ipc: error whilst disconnecting: {}", err)
                }
                break;
            }
        }
    }

    println!("ipc handler closed");
}
