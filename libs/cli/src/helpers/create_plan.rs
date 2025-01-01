use anchor_lang::AnchorSerialize;
use common::helpers::{Claimant, Leaf, MerkleOutput};
use rs_merkle::algorithms::Sha256;
use rs_merkle::{Hasher, MerkleProof, MerkleTree};

pub fn create_plan(leaf_values: Vec<Claimant>) -> MerkleOutput {
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
    for index in 0..leaf_values.len() {
        let indices_to_prove = vec![index];
        let leaves_to_prove = leaves
            .get(index..index + 1)
            .ok_or("can't get leaves to prove")
            .unwrap();
        let merkle_proof = merkle_tree.proof(&indices_to_prove);
        let proof_bytes = merkle_proof.to_bytes();
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
    merkle_output
}
