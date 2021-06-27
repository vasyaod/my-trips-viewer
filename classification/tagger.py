import os
from os.path import isdir, join
from shutil import copyfile

import tempfile
import numpy as np

import PIL.Image as Image
import matplotlib.pylab as plt

import tensorflow as tf
import tensorflow_hub as hub
import tensorflow as tf

print(tf.__version__)

data_path = f"{os.environ['OUTPUT_DATA_PATH']}/data"

all_tracks = [f for f in os.listdir(data_path) if isdir(join(data_path, f))]
#all_tracks = map()

import json

def mF(x):
    with open(data_path + "/" + x + '/trip.json') as f:
      data = json.load(f)
    return (data.get('tags',[]), data_path + "/" + x + '/preview.png', x)

flatten = lambda t: [item for sublist in t for item in sublist]

all_tracks = list(map(mF, all_tracks))
tagged_tracks = list(filter(lambda x : len(x[0]) > 0, all_tracks))
none_tagget_tracks = list(filter(lambda x : len(x[0]) == 0, all_tracks))

#tags = ["school", "office A", "office B"]
tags = ["school"]

feature_extractor_model = "https://tfhub.dev/google/tf2-preview/mobilenet_v2/feature_vector/4"

IMAGE_SHAPE = (224, 224)
batch_size = 32

feature_extractor_layer = hub.KerasLayer(
    feature_extractor_model, input_shape=IMAGE_SHAPE+(3,), trainable=False)

num_classes = 2

normalization_layer = tf.keras.layers.experimental.preprocessing.Rescaling(1./255)

tmppath = tempfile.mkdtemp()
print(f"Temporary path {tmppath}")

def process_tag(tag):
    positive_exes = list(filter(lambda x : tag in x[0], tagged_tracks))
    negative_exes = list(filter(lambda x : not(tag in x[0]), tagged_tracks))

    print(f"Calculation for tag `{tag}`")
    path = f"{tmppath}/{tag}"

    if not os.path.exists(path):
        os.mkdir(path)

    if not os.path.exists(path + "/1"):
        os.mkdir(path + "/1")
                        
    if not os.path.exists(path + "/0"):
        os.mkdir(path + "/0")


    for i in positive_exes:
        copyfile(i[1], f"{path}/1/{i[2]}.png")

    for i in negative_exes:
        copyfile(i[1], f"{path}/0/{i[2]}.png")


    model = tf.keras.Sequential([
        feature_extractor_layer,
        tf.keras.layers.Dense(100, activation='relu'),
        tf.keras.layers.Dense(50, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])

    model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
#    model.summary()

    train_ds = tf.keras.preprocessing.image_dataset_from_directory(
        str(path),
        validation_split=0,
       # subset="training",
        seed=123,
        image_size=IMAGE_SHAPE,
        batch_size=batch_size
    )
    train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
  #  train_ds = train_ds.map(lambda x, y: (data_augmentation(x, training=True), y))

    model.fit(train_ds, epochs=5)

    for i in none_tagget_tracks:
        img = tf.keras.preprocessing.image.load_img(i[1], target_size=IMAGE_SHAPE)
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = normalization_layer(img_array)
        img_array = tf.expand_dims(img_array, 0)  # Create batch axis
        #print(img_array)
        predictions = model.predict(img_array)
        if predictions[0][0] > 0.5:
            print(f"Tag {tag} was added to {i[2]}")
            i[0].append(tag)

for tag in tags:
    process_tag(tag) 

for i in none_tagget_tracks:
    if len(i[0]) > 0:
        trackId = i[2]
        with open(data_path + "/" + trackId + '/trip.json') as f:
            data = json.load(f)
        data['tags'] = i[0]
        data['autoTagged'] = True
        with open(data_path + "/" + trackId + '/trip.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=True, indent=2)