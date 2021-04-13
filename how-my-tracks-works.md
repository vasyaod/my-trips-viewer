# How my-tracks works

https://github.com/vasyaod/my-tracks

_To a man with a hammer, everything looks like a nail._

I think people should control and easily manipulate their own data that they generated. Inspired by 
this idea I've collected all my movements for several years and shared them to GitHub. So here is 
an explanation of how the entire workflow works.

# Step 1. Collecting GPS Data

I use [GPS Logger](https://f-droid.org/en/packages/com.mendhak.gpslogger/) that I strongly recommend.
This app is absolutely amazing. For me, with proper settings, the app doesn't consume energy at all, 
at least I can't see a difference of battery life for working app and stopped. Plus, it is able to save 
all your tracks to a phone file system or remote storages like FTP or other cloud storages. For saving 
energy 60 sec period of GPS location checking was set up, moreover the app doesn't try to enable 
GPS module if a device is not moving (I assume a accelerator is using) or connected to a home Wi-fi 
network.

# Step 2. Data Synchronization

For synchronization [Syncthing](https://syncthing.net/) is using, and also I respect authors and recommend 
for using. The app sends data among all my devices including my private backup server somewhere in 
Europe. Data has additional protection since all my family devices are included in a private network 
created with [Wireguard](https://www.wireguard.com/).

# Step 3. Preprocessing and filtering

At this stage, a script just opens files with coordinates and filter out some noise, and removes tracks
where speed greater than 50 km/h because I want to see only tracks of bike rides or walking. The script 
periodically triggers by Jenkins CI server and also upload/commit/push cleaned tracks to 
the [data repo](https://github.com/vasyaod/my-tracks-data) on Github.

# Step 4. Generation of Github Pages

GPX files in the data repo are not human readable and for fixing this issue static pages were generated
with [Github Action](https://github.com/vasyaod/my-tracks-data/blob/main/.github/workflows/etl.yml). 
For this purpose [a special static engine template/viewer](https://github.com/vasyaod/my-trips-viewer) was 
written which is able to
 
 * render tracks on a map
 * create previews/thumbnails for map
 * create thumbnails of linked images
 * download linked videos from Youtube and create thumbnails for them.

Basically, this stage is needed for converting the data model (GPX tracks and other entities) to human 
readable representation.