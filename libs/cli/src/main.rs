mod helpers;

mod tests;

use crate::helpers::create_plan::create_plan;
use crate::helpers::file_utils::{read_air_dropper_plan_from_file, write_merkle_to_file};
use anyhow::anyhow;
use clap::Parser;
use colored::Colorize;
use std::fs;
use std::process::ExitCode;

#[derive(Parser, Debug)]
pub struct CliArgs {
    #[arg(long)]
    pub input_plan: String,
    #[arg(long)]
    pub output_merkle: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<ExitCode> {
    let args = CliArgs::parse();

    match fs::metadata(&args.input_plan) {
        Ok(_) => {}
        Err(_) => {
            let msg = format!("The file '{}' does not exist.", args.input_plan);
            eprintln!("{}", msg.red());
            return Err(anyhow!(msg));
        }
    }

    match fs::metadata(&args.output_merkle) {
        Ok(_) => {
            let msg = format!("The file '{}' already exist.", args.output_merkle);
            eprintln!("{}", msg.red());
            return Err(anyhow!(msg));
        }
        Err(_) => {}
    }
    let leaf_values = read_air_dropper_plan_from_file(&args.input_plan);
    let merkle_output = create_plan(leaf_values);
    write_merkle_to_file(&args.output_merkle, merkle_output);
    println!(
        "{}",
        format!(
            "Successfully read {} and wrote plan to {}",
            args.input_plan, args.output_merkle
        )
        .green()
    );
    Ok(ExitCode::SUCCESS)
}
