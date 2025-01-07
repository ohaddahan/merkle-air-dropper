import {createFromRoot} from 'codama';
import {rootNodeFromAnchor} from '@codama/nodes-from-anchor';
import MerkleAirDropper from "./target/idl/merkle_air_dropper.json";
import {renderJavaScriptVisitor, renderRustVisitor} from '@codama/renderers';

async function main() {
    console.log("MerkleAirDropper", MerkleAirDropper)
    const codama = createFromRoot(rootNodeFromAnchor(MerkleAirDropper));
    codama.accept(renderJavaScriptVisitor('codama/js'));
    codama.accept(renderRustVisitor('codama/rust'));
}


main().then(() => {
    console.log("done")
}).catch(e => {
    console.error(e)
})