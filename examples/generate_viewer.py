#!/usr/bin/python

from niftidrop.viewer import generate
from glob import glob

# TEMPORARY LOCAL SERVER #####################################################
# Here are images that we want to see, matches with nidm
viewer_input = {"/home/vanessa/Desktop/TStatistic.nii.gz": \
                "/home/vanessa/Desktop/nidm.ttl"}
standard_brain = "/home/vanessa/Desktop/MNI152_T1_2mm_brain.nii.gz"

# You can generate something to view in your browser
# If no base_image is specified, the background will be black
viewer = generate(viewer_input,base_image=standard_brain,view_in_browser=True)
