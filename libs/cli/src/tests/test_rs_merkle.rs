#[cfg(test)]
mod tests {
    use rs_merkle::algorithms::Sha256;
    use rs_merkle::{Hasher, MerkleProof, MerkleTree};

    #[test]
    pub fn rs_merkle() {
        let leaf_values = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        let leaves: Vec<[u8; 32]> = leaf_values
            .iter()
            .map(|x| Sha256::hash(x.as_bytes()))
            .collect();
        let merkle_tree = MerkleTree::<Sha256>::from_leaves(&leaves);
        // let indices_to_prove = vec![3, 4];
        for index in 0..leaf_values.len() {
            let indices_to_prove = vec![index];
            let leaves_to_prove = leaves
                .get(index..index + 1)
                .ok_or("can't get leaves to prove")
                .unwrap();
            let merkle_proof = merkle_tree.proof(&indices_to_prove);
            let merkle_root = merkle_tree
                .root()
                .ok_or("couldn't get the merkle root")
                .unwrap();
            // Serialize proof to pass it to the client
            let proof_bytes = merkle_proof.to_bytes();
            // Parse proof back on the client
            let proof = MerkleProof::<Sha256>::try_from(proof_bytes).unwrap();
            assert!(proof.verify(
                merkle_root,
                &indices_to_prove,
                leaves_to_prove,
                leaves.len()
            ));
        }
    }
}
