#[cfg(test)]
mod tests {
    use crate::helpers::file_utils::{read_keys_from_dir, write_merkle_to_file};
    use anchor_lang::AnchorSerialize;
    use common::helpers::{Claimant, Leaf, MerkleOutput};
    use rs_merkle::algorithms::Sha256;
    use rs_merkle::{Hasher, MerkleProof, MerkleTree};
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
        let leaves: Vec<[u8; 32]> = leaf_values
            .iter()
            .map(|x| Sha256::hash(&*x.as_bytes()))
            .collect();
        let merkle_tree = MerkleTree::<Sha256>::from_leaves(&leaves);
        let mut merkle_output = MerkleOutput {
            root: Vec::new(),
            leafs: Vec::new(),
        };

        let merkle_root = merkle_tree
            .root()
            .ok_or("couldn't get the merkle root")
            .unwrap();

        merkle_output.root = merkle_root.try_to_vec().unwrap();

        // let indices_to_prove = vec![3, 4];
        for index in 0..leaf_values.len() {
            let indices_to_prove = vec![index];
            let leaves_to_prove = leaves
                .get(index..index + 1)
                .ok_or("can't get leaves to prove")
                .unwrap();
            let merkle_proof = merkle_tree.proof(&indices_to_prove);
            let proof_bytes = merkle_proof.to_bytes();
            // println!("index = {} | proof = {:?}", index, proof_bytes);
            // Parse proof back on the client
            let proof = MerkleProof::<Sha256>::try_from(proof_bytes.clone()).unwrap();
            assert!(proof.verify(
                merkle_root,
                &indices_to_prove,
                leaves_to_prove,
                leaves.len()
            ));
            let leaves_to_prove = leaves_to_prove.iter().map(|i| i.to_vec()).collect();
            merkle_output.leafs.push(Leaf {
                index: index as u64,
                proof: proof_bytes.to_vec(),
                claimant: leaf_values.get(index).cloned().unwrap(),
                leaves_to_prove,
            });
        }
        write_merkle_to_file("../../tests-fixtures/merkle/merkle.json", merkle_output);
    }
}
