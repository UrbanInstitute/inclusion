import csv

cr = csv.reader(open("data/source/source.csv", "rU"))
cw = csv.writer(open("data/data.csv","wb"))

head = cr.next()
h = {}
i = 0
for e in head:
	h[e] = i
	i += 1

include = ["place","stateabrev","rankeconhealth1980","rankeconinclusionindex1980","rankraceinclusionindex1980","rankoverallinclusionindex1980","rankeconhealth1990","rankeconinclusionindex1990","rankraceinclusionindex1990","rankoverallinclusionindex1990","rankeconhealth2000","rankeconinclusionindex2000","rankraceinclusionindex2000","rankoverallinclusionindex2000","rankeconhealth2013","rankeconinclusionindex2013","rankraceinclusionindex2013","rankoverallinclusionindex2013","pop1980","pop1990","pop2000","pop2013","everrecover","lat","lon"]

cw.writerow(include)
for row in cr:
	outRow = []
	for ind in include:
		outRow.append(row[h[ind]])
	cw.writerow(outRow)



# head = ["place", "year", "econHealth", "overallInclusion", "raceInclusion", "econInclusion"]
# cw.writerow(head)


# years = ["1980", "1990", "2000","2013"]
# for row in cr:
# 	for year in years:
# 		outRow = []
# 		outRow.append(row[ h["place"] ] + "," + row[ h["stateabrev"] ])
# 		outRow.append( year )
# 		outRow.append(row[ h["rankeconhealth" + year] ])
# 		outRow.append(row[ h["rankoverallinclusionindex" + year] ])
# 		outRow.append(row[ h["rankraceinclusionindex" + year] ])
# 		outRow.append(row[ h["rankeconinclusionindex" + year] ])
# 		cw.writerow(outRow)