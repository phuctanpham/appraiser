#!/bin/bash

# ANSI color codes for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# --- Main Script ---

# 1. Find all directories in the current location (excluding . and ..)
mapfile -t DIRS_ARRAY < <(find . -maxdepth 1 -mindepth 1 -type d | sed 's|^./||')

if [ ${#DIRS_ARRAY[@]} -eq 0 ]; then
    print_error "No directories found in the current location."
    exit 1
fi

# 2. Ask user to select a mode (create or delete)
print_info "Select the mode of operation:"
echo "  1) Create test.txt file"
echo "  2) Delete test.txt file"
read -p "Enter your choice (1-2): " mode

# 3. Display directories and ask user for selection
echo
print_info "Select the directories for the operation:"
echo "  0) All directories"
for i in "${!DIRS_ARRAY[@]}"; do
    printf "  %d) %s\n" $((i+1)) "${DIRS_ARRAY[$i]}"
done
echo

read -p "Enter numbers separated by space (e.g., 1 3 5), or 0 for all: " dir_numbers

# 4. Process the selection
SELECTED_DIRS=()
if [[ "$dir_numbers" == "0" ]]; then
    print_info "All directories selected."
    SELECTED_DIRS=("${DIRS_ARRAY[@]}")
else
    for num in $dir_numbers; do
        index=$((num-1))
        if [ $index -ge 0 ] && [ $index -lt ${#DIRS_ARRAY[@]} ]; then
            SELECTED_DIRS+=("${DIRS_ARRAY[$index]}")
        else
            print_warning "Invalid number: $num (skipped)"
        fi
    done
fi

if [ ${#SELECTED_DIRS[@]} -eq 0 ]; then
    print_error "No valid directories were selected. Exiting."
    exit 1
fi

echo
print_info "Selected directories:"
for dir in "${SELECTED_DIRS[@]}"; do
    echo "  - $dir"
done
echo

# 5. Perform the chosen action
case $mode in
    1) # Create mode
        print_info "Creating 'test.txt' in selected directories..."
        for dir in "${SELECTED_DIRS[@]}"; do
            touch "$dir/test.txt"
            if [ $? -eq 0 ]; then
                echo "  - Created in '$dir'"
            else
                print_error "Failed to create in '$dir'"
            fi
        done
        ;;
    2) # Delete mode
        print_info "Deleting 'test.txt' from selected directories..."
        for dir in "${SELECTED_DIRS[@]}"; do
            if [ -f "$dir/test.txt" ]; then
                rm "$dir/test.txt"
                echo "  - Deleted from '$dir'"
            else
                print_warning "'test.txt' not found in '$dir' (skipped)"
            fi
        done
        ;;
    *)
        print_error "Invalid mode selected. Please run the script again and choose 1 or 2."
        exit 1
        ;;
esac

echo
print_info "Operation completed successfully."
