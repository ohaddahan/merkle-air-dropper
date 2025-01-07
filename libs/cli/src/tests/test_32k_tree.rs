#[cfg(test)]
mod tests {
    use crate::helpers::create_plan::create_plan;
    use crate::helpers::file_utils::{
        is_file_exists, read_keypair_from_file, write_keypair_to_file, write_merkle_to_file,
        write_plan_to_file,
    };
    use common::helpers::Claimant;
    use solana_sdk::native_token::LAMPORTS_PER_SOL;
    use solana_sdk::signature::Keypair;
    use solana_sdk::signer::Signer;

    #[test]
    pub fn test_32k_tree() {
        let mut keys: Vec<Keypair> = Vec::with_capacity(50_000);
        for index in 0..32_000 {
            let f = format!("../../tests-fixtures/32k-keys/{}.json", index);
            let keypair = Keypair::new();
            write_keypair_to_file(&f, &keypair);
            let keypair = if is_file_exists(&f) {
                read_keypair_from_file(&f)
            } else {
                let k = Keypair::new();
                write_keypair_to_file(&f, &k);
                k
            };
            keys.push(keypair)
        }
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
