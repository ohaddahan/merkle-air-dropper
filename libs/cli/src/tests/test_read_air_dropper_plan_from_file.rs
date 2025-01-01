#[cfg(test)]
mod tests {
    use crate::helpers::create_plan::create_plan;
    use crate::helpers::file_utils::{read_air_dropper_plan_from_file, write_merkle_to_file};

    #[test]
    pub fn test_read_air_dropper_plan_from_file() {
        let leaf_values = read_air_dropper_plan_from_file("../../tests-fixtures/plan/plan.json");
        let merkle_output = create_plan(leaf_values);
        write_merkle_to_file("../../tests-fixtures/plan/merkle.json", merkle_output);
    }
}
