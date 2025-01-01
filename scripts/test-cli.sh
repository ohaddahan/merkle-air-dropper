#!/usr/bin/env bash
export SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cargo build -p cli
cargo test -p cli -- --nocapture