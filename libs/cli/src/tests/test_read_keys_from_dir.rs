#[cfg(test)]
mod tests {
    use crate::helpers::create_plan::create_plan;
    use crate::helpers::file_utils::{read_keys_from_dir, write_merkle_to_file};
    use common::helpers::Claimant;
    use solana_sdk::native_token::LAMPORTS_PER_SOL;
    use solana_sdk::signer::Signer;

    #[test]
    pub fn test_read_keys_from_dir() {
        let keys = read_keys_from_dir("../../tests-fixtures/keys");
        let mut leaf_values: Vec<Claimant> = Vec::new();
        for (index, key) in keys.iter().enumerate() {
            leaf_values.push(Claimant {
                claimant: key.pubkey(),
                amount: index as u64 * LAMPORTS_PER_SOL,
            })
        }
        let merkle_output = create_plan(leaf_values);
        write_merkle_to_file("../../tests-fixtures/merkle/merkle.json", merkle_output);
    }
}
