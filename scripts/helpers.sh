#!/usr/bin/env bash
function extend() {
  local add="$1"
  local size="$2"
  solana program extend "${add}" "${size}"
}

function show_buffers() {
  solana program show --buffers
}

function close_buffers() {
  solana program close --buffer
}

function deploy_program() {
  local program_id="$1"
  local rpc="$2"
  local shared_object="$3" ; # target/deploy/merkle_air_dropper.so
   solana program deploy \
   --use-rpc \
   --max-sign-attempts 60 \
   --with-compute-unit-price 60000 \
   --program-id "${program_id}" \
   --use-quic \
   --allow-excessive-deploy-account-balance \
    --url "${rpc}" \
    "${shared_object}"
}

function upgrade_idl() {
  local idl="$1" ; # target/idl/merkle_air_dropper.json
  local program_id="$2" ; # 6yGnfw6ahHDQXequrUaQNv6UxbdmceQYGvZUtFDFrHqR
  local rpc="$3"
  anchor idl upgrade \
  --filepath "${idl}" \
  "${program_id}" \
  --provider.cluster "${rpc}"
}