# Steg 1
# import os
# import re
# print('start')
# # Directory containing your TypeScript files
# ts_directory = '/Users/anne-siritronnes/repos/mimir/src/main/resources/site/parts/'

# # Regular expression to match the interface definitions
# interface_regex = re.compile(r'interface (\w+Props) \{[\s\S]*?\n\}', re.MULTILINE)
# # print(os.listdir(ts_directory))
# for folder in os.listdir(ts_directory):
#   for filename in os.listdir(ts_directory + folder + '/'):
#     if filename.endswith(".ts"):
#         print(filename)
#         with open(os.path.join(ts_directory + folder + '/', filename), 'r') as file:
#             content = file.read()
#             matches = interface_regex.findall(content)
#             for match in matches:
#                 interface_name = match
#                 # Extract the interface body using the matched interface name
#                 interface_body_match = re.search(f'interface {interface_name} \\{{[\\s\\S]*?\\n\\}}', content)
#                 if interface_body_match:
#                     interface_body = interface_body_match.group(0)
#                     # Create a new file for the interface
#                     new_filename = os.path.join(ts_directory, f'{interface_name}.ts')
#                     with open(new_filename, 'w') as new_file:
#                         new_file.write(interface_body)
#                     print(f'Extracted {interface_name} to {new_filename}')
#                 # Optional: Remove the original interface from the file and add an import statement
#                 # content = re.sub(interface_body, f'import {{ {interface_name} }} from "./{interface_name}";\n', content)
#                 # with open(os.path.join(ts_directory, filename), 'w') as file_to_update:
#                 #     file_to_update.write(content)



# Steg 2
import os
import re
print('start')
# Directory containing your TypeScript files
ts_directory = '/Users/anne-siritronnes/repos/mimir/src/main/resources/site/parts/'

# Regular expression to match the interface definitions
interface_regex = re.compile(r'interface (\w+) \{[\s\S]*?\n\}', re.MULTILINE)
# print(os.listdir(ts_directory))
for folder in os.listdir(ts_directory):
  for filename in os.listdir(ts_directory + folder + '/'):
    if filename.endswith(".ts"):
        print(filename)
        with open(os.path.join(ts_directory + folder + '/', filename), 'r') as file:
            content = file.read()
            interface_bodies = interface_regex.findall(content)
            if interface_bodies:
                combined_interfaces = ""
                for interface_name in interface_bodies:
                    # Extract each interface body using the captured interface name
                    interface_body_match = re.search(f'interface {interface_name} \\{{[\\s\\S]*?\\n\\}}', content)
                    if interface_body_match:
                        combined_interfaces += interface_body_match.group(0) + "\n\n"
                
                if combined_interfaces:
                    # Naming the new file after the original with a suffix or change as needed
                    new_filename = os.path.join(ts_directory, f'{os.path.splitext(filename)[0]}Props.ts')
                    with open(new_filename, 'w') as new_file:
                        new_file.write(combined_interfaces)
                    print(f'Extracted interfaces to {new_filename}')
