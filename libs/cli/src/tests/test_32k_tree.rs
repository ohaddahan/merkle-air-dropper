#[cfg(test)]
mod tests {
    use crate::helpers::create_plan::create_plan;
    use crate::helpers::file_utils::write_merkle_to_file;
    use common::helpers::Claimant;
    use solana_sdk::native_token::LAMPORTS_PER_SOL;
    use solana_sdk::signature::Keypair;
    use solana_sdk::signer::Signer;

    #[test]
    pub fn test_32k_tree() {
        let mut keys: Vec<Keypair> = Vec::with_capacity(50_000);
        for _ in 0..32_000 {
            keys.push(Keypair::new())
        }
        let mut leaf_values: Vec<Claimant> = Vec::new();
        for (index, key) in keys.iter().enumerate() {
            leaf_values.push(Claimant {
                claimant: key.pubkey(),
                amount: index as u64 * LAMPORTS_PER_SOL,
            })
        }
        let merkle_output = create_plan(leaf_values);
        write_merkle_to_file("../../tests-fixtures/merkle/32k_merkle.json", merkle_output);
    }
}
