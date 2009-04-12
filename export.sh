#!/bin/sh
export COPY_EXTENDED_ATTRIBUTES_DISABLE=true
export COPYFILE_DISABLE=true
tar --exclude .DS_Store --exclude .svn --exclude '._*' -czvf theme-stressfree.tar.gz theme-stressfree   
export COPY_EXTENDED_ATTRIBUTES_DISABLE=false
export COPYFILE_DISABLE=false
