'''
utils.py: part of the niftidrop package
Functions to work with html templates

'''

import os
import tempfile
import shutil
import contextlib
import string
import random
import utils
import zipfile
import numpy as np

# Get the directory of the package
def get_package_dir():
    return os.path.abspath(os.path.join(os.path.dirname(utils.__file__)))

# Make directory
def make_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

# Unzip static files to temporary directory
def unzip(source,dest_dir):
    with zipfile.ZipFile(source, "r") as z:
        z.extractall(dest_dir)

# Make temporary directory
@contextlib.contextmanager
def make_tmp_folder():
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)

# Filename
def get_name(path):
    return os.path.split(path)[1].split(".")[0]

def get_random_name(length=6,chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(length))

# Generate new png paths to correspond to nifti filenames
def make_png_paths(nifti_files):
    image_paths = []
    for i in range(0,len(mr_files)):
        image = mr_files[i]
        tmp_svg = "%s/tmpbrain%s.png" %(tmp_dir,i)
        make_glassbrain_image(image,tmp_svg)
        image_paths.append(tmp_svg)
    return image_paths

def get_extension(path):
    fileparts =  os.path.basename(path).split(".")
    fileparts.pop(0)
    return ".".join(fileparts)

# Get unique values in a list of lists
def unwrap_list_unique(list_of_lists):
    uniques = []
    for listy in list_of_lists:
        uniques = uniques + [item for item in listy]
    uniques = list(np.unique(uniques))
    return uniques
