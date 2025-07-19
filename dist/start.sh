#!/bin/bash

write_gps_with_size_limit() {
  local device="${1:-/dev/ttyACM0}"
  local output="${2:-gps_data.log}"
  local max_size_bytes=2048  # 2 KB

  truncate_file() {
    local total_lines filesize keep_lines
    filesize=$(stat -c%s "$output" 2>/dev/null || echo 0)
    if (( filesize <= max_size_bytes )); then
      return
    fi

    total_lines=$(wc -l < "$output")
    keep_lines=$(( total_lines * 9 / 10 ))
    if (( keep_lines > 0 )); then
      tail -n "$keep_lines" "$output" > "${output}.tmp" && mv "${output}.tmp" "$output"
    fi
  }

  touch "$output"

  stdbuf -oL cat "$device" | while IFS= read -r line; do
    echo "$line" >> "$output"
    filesize=$(stat -c%s "$output" 2>/dev/null || echo 0)
    if (( filesize > max_size_bytes )); then
      truncate_file
    fi
  done
}

mkdir -p logs
write_gps_with_size_limit /dev/ttyACM0 ./logs/gps_data.log & node index.js