#!/bin/bash

RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="./scripts"

function run_script() {
    local script_name=$1
    local script_path="${SCRIPT_DIR}/${script_name}.sh"

    if [[ -f "$script_path" ]]; then
        source "$script_path" # Charge et exécute le script
    else
        echo -e "${RED}Erreur : Le script ${script_name}.sh n'existe pas dans ${SCRIPT_DIR}.${NC}"
    fi
}