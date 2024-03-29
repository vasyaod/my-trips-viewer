import os
import sys
from os.path import isdir, join
from shutil import copyfile

import tempfile
import numpy as np

import PIL.Image as Image
import matplotlib.pylab as plt

import tensorflow as tf
import tensorflow_hub as hub
import tensorflow as tf

import yaml

print("Tensor flow version", tf.__version__)

IMAGE_SHAPE = (224, 224)
batch_size = 32

num_classes = 2

img = tf.keras.preprocessing.image.load_img("./preview-test.png", target_size=IMAGE_SHAPE)
img_array = tf.keras.preprocessing.image.img_to_array(img)

input_data_path = os.environ.get('INPUT_DATA_PATH', "/home/vasyaod/work/my-tracks-data")
output_data_path = os.environ.get('OUTPUT_DATA_PATH', "/home/vasyaod/work/my-tracks") + "/data"
auto_tag_str = os.environ.get('AUTO_TAGS', "")

all_tracks = [f for f in os.listdir(input_data_path) if isdir(join(input_data_path, f)) and not(f.startswith("."))]

def mF(x):
    with open(f"{input_data_path}/{x}/trip.yml") as f:
      data = yaml.safe_load(f)
      tag_str = data.get("tags", "")
      tags = [x.strip() for x in tag_str.split(',') if not(x == "")]
    return (tags, output_data_path + "/" + x + '/preview.png', x)

all_tracks = list(filter(lambda x : os.path.exists(x[1]), list(map(mF, all_tracks))))
tagged_tracks = list(filter(lambda x : len(x[0]) > 0, all_tracks))
none_tagget_tracks = list(filter(lambda x : len(x[0]) == 0, all_tracks))

if len(tagged_tracks) == 0:
    print(f"There is no tags in the data")
    sys.exit()


tags = auto_tag_str.split(",") #["school", "office B", "office C", "office A", "tandem", "recumbent"]
print("Auto tag list", tags)
#tags = ["school"]

feature_extractor_model = "https://tfhub.dev/google/tf2-preview/mobilenet_v2/feature_vector/4"

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

    feature_extractor_layer = hub.KerasLayer(
        feature_extractor_model, input_shape=IMAGE_SHAPE+(3,), trainable=False)


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
        try:
            img = tf.keras.preprocessing.image.load_img(i[1], target_size=IMAGE_SHAPE)
            img_array = tf.keras.preprocessing.image.img_to_array(img)
            img_array = normalization_layer(img_array)
            img_array = tf.expand_dims(img_array, 0)  # Create batch axis
            #print(img_array)
            predictions = model.predict(img_array)
            if predictions[0][0] > 0.5:
                print(f"Tag {tag} was added to {i[2]}")
                i[0].append(tag)

        except Exception as err:
            print('Handling run-time error:', err)
            pass

for tag in tags:
    process_tag(tag) 

for i in none_tagget_tracks:
    if len(i[0]) > 0:
        trackId = i[2]
        tags = i[0]
        with open(f"{input_data_path}/{trackId}/trip.yml") as f:
            data = yaml.safe_load(f)
        data['tags'] = ','.join(tags)
        data['autoTagged'] = True
        with open(f"{input_data_path}/{trackId}/trip.yml", 'w', encoding='utf-8') as f:
            yaml.dump(data, f)