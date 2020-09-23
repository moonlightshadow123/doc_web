import datetime,json,copy, os
from pathlib import Path
from werkzeug.utils import secure_filename
from pypinyin import lazy_pinyin


BASE_FOLDER = "../site/extra"
BASE_URL = "/extra/"

class Extra:
    def __init__(self, folder_name):
        self.folder_name = folder_name
        self.folder_path = os.path.abspath(os.path.join(BASE_FOLDER, folder_name))
        Path(self.folder_path).mkdir(parents=True, exist_ok=True)

    def getPath(self, filename):
        return os.path.join(self.folder_path, filename)

    def addFile(self, file):
        filename = secure_filename("".join(lazy_pinyin(file.filename)))
        #with open(self.getPath(filename), "wb") as f:
        #    pass
        file.save(self.getPath(filename))
        #file.save("./", filename)

    def rmFile(self, filename):
        try:
            os.remove(self.getPath(filename))
        except OSError:
            pass

    def listFiles(self):
        onlyfiles = [f for f in os.listdir(self.folder_path) \
                if os.path.isfile(self.getPath(f))]
        return onlyfiles

    def getBaseUrl(self):
        return BASE_URL + self.folder_name + "/";

if __name__ == "__main__":
    extra = Extra("projTest")
    print(extra.listFiles())