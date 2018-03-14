import csv

cr = csv.reader(open("data/source/source.csv", "rU"))
cw = csv.writer(open("data/data.csv","wb"))

head = cr.next()
h = {}
i = 0
for e in head:
	h[e] = i
	i += 1

include = ["place","stateabrev","rankeconhealth1980","rankeconinclusionindex1980","rankraceinclusionindex1980","rankoverallinclusionindex1980","rankeconhealth1990","rankeconinclusionindex1990","rankraceinclusionindex1990","rankoverallinclusionindex1990","rankeconhealth2000","rankeconinclusionindex2000","rankraceinclusionindex2000","rankoverallinclusionindex2000","rankeconhealth2013","rankeconinclusionindex2013","rankraceinclusionindex2013","rankoverallinclusionindex2013","pop1980","pop1990","pop2000","pop2013","everrecover","lat","lon","recovperiod"]

cw.writerow(include)
for row in cr:
	outRow = []
	for ind in include:
		outRow.append(row[h[ind]])
	cw.writerow(outRow)
