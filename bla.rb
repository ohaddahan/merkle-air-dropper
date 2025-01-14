require 'json'

# Directory containing the JSON files
input_directory = './tests-fixtures/32k-keys' # Change this to your directory path
output_file = 'combined.json'

# Collect all JSON files from the directory
json_files = Dir.glob("#{input_directory}/*.json")

# Initialize an array to hold all JSON objects
combined_json = []

# Iterate over each file and parse its JSON content
json_files.each do |file|
  begin
    # Read and parse JSON content
    content = File.read(file)
    json_object = JSON.parse(content)
    combined_json << json_object
  rescue JSON::ParserError => e
    puts "Error parsing #{file}: #{e.message}"
  end
end

# Write the combined JSON array to the output file
File.open(output_file, 'w') do |f|
  f.write(JSON.pretty_generate(combined_json))
end

puts "Combined JSON has been written to #{output_file}"

