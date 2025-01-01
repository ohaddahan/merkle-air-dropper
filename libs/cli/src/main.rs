mod helpers;
mod tests;
use clap::Parser;

#[derive(Parser, Debug)]
pub struct CliArgs {
    #[arg(long, default_value = "127.0.0.1")]
    pub ip: String,
    #[arg(long, default_value = "5000")]
    pub port: u16,
}

#[tokio::main]
async fn main() {
    let args = CliArgs::parse();
    println!("args = {:#?}", args);
}
