#[cfg(test)]
mod tests {
    use crate::helpers::create_plan::create_plan;
    use crate::helpers::file_utils::{
        is_file_exists, read_combined_from_file, read_keypair_from_file, write_keypair_to_file,
        write_merkle_to_file, write_plan_to_file,
    };
    use common::helpers::Claimant;
    use solana_sdk::native_token::LAMPORTS_PER_SOL;
    use solana_sdk::signature::Keypair;
    use solana_sdk::signer::Signer;

    #[test]
    pub fn test_32k_tree() {
        let keys = read_combined_from_file("../../tests-fixtures/32k-keys/combined.json");
        let mut leaf_values: Vec<Claimant> = Vec::new();
        for (index, key) in keys.iter().enumerate() {
            leaf_values.push(Claimant {
                claimant: key.pubkey(),
                amount: index as u64 * LAMPORTS_PER_SOL,
            })
        }
        write_plan_to_file("../../tests-fixtures/plan/32k_plan.json", &leaf_values);
        let merkle_output = create_plan(leaf_values);
        write_merkle_to_file("../../tests-fixtures/merkle/32k_merkle.json", merkle_output);
    }
}
