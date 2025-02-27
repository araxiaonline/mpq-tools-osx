#pragma once
#include <string>

class MPQHandler {
public:
    MPQHandler(const std::string& mpqPath);
    ~MPQHandler();

    void listFiles();
    void extractFile(const std::string& filePath);
    void addFile(const std::string& filePath, const std::string& targetPath = "");
    void createArchive(const std::string& path, int version);

private:
    std::string mpqPath;
};
