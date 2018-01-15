import csv

cr = csv.reader(open("data/source/source.csv", "rU"))
cw = csv.writer(open("data/econHealth.csv","wb"))

head = cr.next()
h = {}
i = 0
for e in head:
	h[e] = i
	i += 1
print h

head = ["place", "year", "econHealth", "overallInclusion", "raceInclusion", "econInclusion"]
cw.writerow(head)


years = ["1980", "1990", "2000","2013"]
for row in cr:
	for year in years:
		outRow = []
		outRow.append(row[ h["place"] ] + "," + row[ h["stateabrev"] ])
		outRow.append( year )
		outRow.append(row[ h["rankeconhealth" + year] ])
		outRow.append(row[ h["rankoverallinclusionindex" + year] ])
		outRow.append(row[ h["rankraceinclusionindex" + year] ])
		outRow.append(row[ h["rankeconinclusionindex" + year] ])
		cw.writerow(outRow)