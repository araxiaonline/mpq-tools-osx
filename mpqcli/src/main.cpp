#include <iostream>
#include <string>
#include "mpq_handler.hpp"

int main(int argc, char* argv[]) {
    if (argc < 3) {
        std::cout << "Usage: mpqcli <command> <mpq_file> [file_path] [target_path]" << std::endl;
        std::cout << "Commands:" << std::endl;
        std::cout << "  list     - List contents of MPQ file" << std::endl;
        std::cout << "  extract  - Extract file from MPQ" << std::endl;
        std::cout << "  add      - Add file to MPQ (optional target_path)" << std::endl;
        std::cout << "  create   - Create new MPQ archive (v1 or v2)" << std::endl;
        return 1;
    }

    std::string command = argv[1];
    std::string mpqPath = argv[2];
    MPQHandler handler(mpqPath);

    if (command == "list") {
        handler.listFiles();
    }
    else if (command == "extract" && argc > 3) {
        handler.extractFile(argv[3]);
    }
    else if (command == "add" && argc > 3) {
        std::string targetPath = argc > 4 ? argv[4] : "";
        handler.addFile(argv[3], targetPath);
    }
    else if (command == "create") {
        int version = (argc > 3 && std::string(argv[3]) == "-v2") ? 2 : 1;
        handler.createArchive(mpqPath, version);
    }
    else {
        std::cout << "Invalid command or missing arguments" << std::endl;
        return 1;
    }

    return 0;
}
