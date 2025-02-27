#include "mpq_handler.hpp"
#include <StormLib.h>
#include <iostream>

MPQHandler::MPQHandler(const std::string& path) : mpqPath(path) {}

MPQHandler::~MPQHandler() {}

void MPQHandler::listFiles() {
    HANDLE hMpq = NULL;
    if (!SFileOpenArchive(mpqPath.c_str(), 0, STREAM_FLAG_READ_ONLY, &hMpq)) {
        std::cerr << "Failed to open MPQ file" << std::endl;
        return;
    }

    SFILE_FIND_DATA findData;
    HANDLE hFind = SFileFindFirstFile(hMpq, "*", &findData, NULL);
    
    if (hFind) {
        do {
            std::cout << findData.cFileName << std::endl;
        } while (SFileFindNextFile(hFind, &findData));

        SFileFindClose(hFind);
    }

    SFileCloseArchive(hMpq);
}

void MPQHandler::extractFile(const std::string& filePath) {
    HANDLE hMpq = NULL;
    if (!SFileOpenArchive(mpqPath.c_str(), 0, STREAM_FLAG_READ_ONLY, &hMpq)) {
        std::cerr << "Failed to open MPQ file" << std::endl;
        return;
    }

    HANDLE hFile = NULL;
    if (!SFileOpenFileEx(hMpq, filePath.c_str(), SFILE_OPEN_FROM_MPQ, &hFile)) {
        std::cerr << "Failed to open file in MPQ" << std::endl;
        SFileCloseArchive(hMpq);
        return;
    }

    // Create output file
    FILE* outFile = fopen(filePath.c_str(), "wb");
    if (!outFile) {
        std::cerr << "Failed to create output file" << std::endl;
        SFileCloseFile(hFile);
        SFileCloseArchive(hMpq);
        return;
    }

    char buffer[4096];
    DWORD bytesRead;

    while (SFileReadFile(hFile, buffer, sizeof(buffer), &bytesRead, NULL)) {
        if (bytesRead == 0) break;
        fwrite(buffer, 1, bytesRead, outFile);
    }

    fclose(outFile);
    SFileCloseFile(hFile);
    SFileCloseArchive(hMpq);
}

void MPQHandler::addFile(const std::string& filePath, const std::string& targetPath) {
    HANDLE hMpq = NULL;
    if (!SFileOpenArchive(mpqPath.c_str(), 0, 0, &hMpq)) {
        std::cerr << "Failed to open MPQ file" << std::endl;
        return;
    }

    const char* archivePath = targetPath.empty() ? filePath.c_str() : targetPath.c_str();
    if (!SFileAddFileEx(hMpq, filePath.c_str(), archivePath, 
                       MPQ_FILE_COMPRESS | MPQ_FILE_REPLACEEXISTING,
                       MPQ_COMPRESSION_ZLIB, MPQ_COMPRESSION_NEXT_SAME)) {
        std::cerr << "Failed to add file to MPQ" << std::endl;
    }

    SFileCloseArchive(hMpq);
}

void MPQHandler::createArchive(const std::string& path, int version) {
    HANDLE hMpq = NULL;
    DWORD dwFlags = version == 2 ? MPQ_CREATE_ARCHIVE_V2 : MPQ_CREATE_ARCHIVE_V1;
    
    // Add .mpq extension if not present
    std::string finalPath = path;
    if (finalPath.length() < 4 || finalPath.substr(finalPath.length() - 4) != ".mpq") {
        finalPath += ".mpq";
    }
    
    if (!SFileCreateArchive(finalPath.c_str(), dwFlags, 1000, &hMpq)) {
        std::cerr << "Failed to create MPQ archive" << std::endl;
        return;
    }

    SFileCloseArchive(hMpq);
}
