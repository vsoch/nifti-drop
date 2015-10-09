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


# WEB SERVER ###############################################################

# Paths must be relative to web server
viewer_input = {"TStatistic.nii.gz":"nidm.ttl"}
standard_brain = "MNI152_T1_2mm_brain.nii.gz"

# We will render the html_snippet into a page to include elsewhere
html_snippet = generate(viewer_input,base_image=standard_brain)
