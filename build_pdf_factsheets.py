# -*- coding: utf-8 -*-

import pdfkit
import csv
import re
from os import path



cr = csv.reader(open("data/data.csv","r"))
h = {}
c = 0
head = next(cr)
for val in head:
	h[val] = c
	c += 1


def getPlaceSlug(place, state):
	place = place.lower()
	place = re.sub(r'[^\w\s]+', "",place)
	place = re.sub('\s',"_",place) + "_" + state
	return place

options = {"javascript-delay": 300}
for row in cr:
	place = row[h["place"]]
	state = row[h["stateabrev"]]
	placeSlug = getPlaceSlug(place, state)
	if not path.exists('factsheets/full/%s.pdf'%placeSlug):
		pdfkit.from_url('http://localhost:8080/index.html?city=%s&print=true'%placeSlug, 'factsheets/full/%s.pdf'%placeSlug, options=options)
