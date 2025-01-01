#[cfg(test)]
mod tests {
    use crate::helpers::file_utils::read_merkle_from_file;
    use rs_merkle::algorithms::Sha256;
    use rs_merkle::MerkleProof;

    #[test]
    pub fn test_read_merkle_from_file() {
        let merkle_output = read_merkle_from_file("../../tests-fixtures/merkle/merkle.json");
        let leaf_values = merkle_output.leaf_values();
        let leaves = merkle_output.leaves();
        let merkle_root = merkle_output.root;
        let merkle_root = <[u8; 32]>::try_from(merkle_root).unwrap();
        for index in 0..leaf_values.len() {
            let indices_to_prove = vec![index];
            let leaves_to_prove = leaves
                .get(index..index + 1)
                .ok_or("can't get leaves to prove")
                .unwrap();
            let proof_bytes = merkle_output.leafs.get(index).unwrap().clone().proof;
            let proof = MerkleProof::<Sha256>::try_from(proof_bytes.clone()).unwrap();
            assert!(proof.verify(
                merkle_root,
                &indices_to_prove,
                leaves_to_prove,
                leaves.len()
            ));
        }
    }
}
