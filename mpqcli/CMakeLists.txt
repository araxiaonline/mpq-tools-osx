cmake_minimum_required(VERSION 3.10)
project(mpqcli)

# Set C++ standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Set output directories
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)

# Add StormLib
add_subdirectory(extern/StormLib)

# Add source files
add_executable(mpqcli
    src/main.cpp
    src/mpq_handler.cpp
)

# Include directories
target_include_directories(mpqcli PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/extern/StormLib/src
)

# Link libraries
target_link_libraries(mpqcli PRIVATE storm)
