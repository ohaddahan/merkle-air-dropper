#![allow(dead_code)]
use common::helpers::{Claimant, MerkleOutput};
use serde::Serialize;
use solana_sdk::signature::Keypair;
use std::fs::File;
use std::io::{Read, Write};
use std::{env, fs};

pub fn read_air_dropper_plan_from_file(path: &str) -> Vec<Claimant> {
    let cwd = env::current_dir().unwrap();
    let full_path = format!("{}/{}", cwd.to_str().unwrap_or_default(), path);
    let file_content = fs::read_to_string(full_path.clone()).unwrap_or_else(|_| {
        panic!(
            "[read_merkle_from_file]::Failed to read the file = {}",
            full_path
        )
    });
    let vec: Vec<Claimant> =
        serde_json::from_str(&file_content).expect("Failed to deserialize JSON");
    vec
}

pub fn read_keys_from_dir(path: &str) -> Vec<Keypair> {
    let cwd = env::current_dir().unwrap();
    let full_path = format!("{}/{}", cwd.to_str().unwrap_or_default(), path);
    let mut keys: Vec<Keypair> = Vec::new();
    for entry in fs::read_dir(full_path.clone())
        .unwrap_or_else(|_| panic!("[read_keys_from_dir] Failed to read file = {}", full_path))
    {
        let entry = entry.unwrap();
        let path = entry.path();
        if path.is_file() {
            let mut file = File::open(path).unwrap();
            let mut content = String::new();
            file.read_to_string(&mut content).unwrap();
            let keypair_bytes: Vec<u8> = serde_json::from_str(&content).unwrap();
            let keypair = Keypair::from_bytes(&keypair_bytes).unwrap();
            keys.push(keypair);
        }
    }
    keys
}

pub fn read_combined_from_file(path: &str) -> Vec<Keypair> {
    let mut file = File::open(path).unwrap();
    let mut content = String::new();
    file.read_to_string(&mut content).unwrap();
    let keypairs: Vec<Vec<u8>> = serde_json::from_str(&content).unwrap();
    keypairs
        .into_iter()
        .map(|key| Keypair::from_bytes(&*key).unwrap())
        .collect()
}

pub fn read_keypair_from_file(path: &str) -> Keypair {
    let mut file = File::open(path).unwrap();
    let mut content = String::new();
    file.read_to_string(&mut content).unwrap();
    let keypair_bytes: Vec<u8> = serde_json::from_str(&content).unwrap();
    Keypair::from_bytes(&keypair_bytes).unwrap()
}

pub fn write_keypair_to_file(file_path: &str, keypair: &Keypair) {
    let cwd = env::current_dir().unwrap();
    let full_path = format!("{}/{}", cwd.to_str().unwrap_or_default(), file_path);
    let mut file = File::create(full_path.clone()).unwrap_or_else(|_| {
        panic!(
            "[write_keypair_to_file]::Failed to write file = {}",
            full_path
        )
    });
    let keypair_str = serde_json::to_string_pretty(&keypair.to_bytes().to_vec()).unwrap();
    file.write_all(keypair_str.as_bytes()).unwrap();
}

pub fn write_plan_to_file<T>(file_path: &str, records: &[T])
where
    T: Serialize,
{
    let cwd = env::current_dir().unwrap();
    let full_path = format!("{}/{}", cwd.to_str().unwrap_or_default(), file_path);
    let mut file = File::create(full_path.clone())
        .unwrap_or_else(|_| panic!("[write_plan_to_file]::Failed to write file = {}", full_path));
    let records_str = serde_json::to_string_pretty(&records).unwrap();
    file.write_all(records_str.as_bytes()).unwrap();
}

pub fn write_merkle_to_file(file_path: &str, merkle_output: MerkleOutput) {
    let cwd = env::current_dir().unwrap();
    let full_path = format!("{}/{}", cwd.to_str().unwrap_or_default(), file_path);
    let mut file = File::create(full_path.clone()).unwrap_or_else(|_| {
        panic!(
            "[write_merkle_to_file]::Failed to write file = {}",
            full_path
        )
    });
    let merkle_str = serde_json::to_string_pretty(&merkle_output).unwrap();
    file.write_all(merkle_str.as_bytes()).unwrap();
}

pub fn read_merkle_from_file(file_path: &str) -> MerkleOutput {
    let cwd = env::current_dir().unwrap();
    let full_path = format!("{}/{}", cwd.to_str().unwrap_or_default(), file_path);
    let file_content = fs::read_to_string(full_path.clone()).unwrap_or_else(|_| {
        panic!(
            "[read_merkle_from_file]::Failed to read the file = {}",
            full_path
        )
    });
    let merkle: MerkleOutput = serde_json::from_str(&file_content).unwrap_or_else(|_| {
        panic!(
            "[read_merkle_from_file]::Failed to deserialize JSON to = {}",
            full_path
        )
    });
    merkle
}

pub fn is_file_exists(path: &str) -> bool {
    fs::metadata(path).is_ok()
}
