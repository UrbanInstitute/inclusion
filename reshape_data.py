import csv

cr = csv.reader(open("data/source/source.csv", "rU"))
cw = csv.writer(open("data/data.csv","wb"))

head = cr.next()
h = {}
i = 0
for e in head:
	h[e] = i
	i += 1

print h

include = ["place","stateabrev","rankeconhealth1990","rankeconinclusionindex1990","rankraceinclusionindex1990","rankoverallinclusionindex1990","rankeconhealth2000","rankeconinclusionindex2000","rankraceinclusionindex2000","rankoverallinclusionindex2000","rankeconhealth2010","rankeconinclusionindex2010","rankraceinclusionindex2010","rankoverallinclusionindex2010","rankeconhealth2015","rankeconinclusionindex2015","rankraceinclusionindex2015","rankoverallinclusionindex2015","pop1990","pop2000","pop2010","pop2015","unemprate1990","unemprate2000","unemprate2010","unemprate2015","MEANunemprate1990","MEANunemprate2000","MEANunemprate2010","MEANunemprate2015","vacancyrate1990","vacancyrate2000","vacancyrate2010","vacancyrate2015","MEANvacancyrate1990","MEANvacancyrate2000","MEANvacancyrate2010","MEANvacancyrate2015","medfamincome1990","medfamincome2000","medfamincome2010","medfamincome2015","MEANmedfamincome1990","MEANmedfamincome2000","MEANmedfamincome2010","MEANmedfamincome2015","rentburden1990","rentburden2000","rentburden2010","rentburden2015","MEANrentburden1990","MEANrentburden2000","MEANrentburden2010","MEANrentburden2015","workingpoor1990","workingpoor2000","workingpoor2010","workingpoor2015","MEANworkingpoor1990","MEANworkingpoor2000","MEANworkingpoor2010","MEANworkingpoor2015","pct1619notinschool1990","pct1619notinschool2000","pct1619notinschool2010","pct1619notinschool2015","MEANpct1619notinschool1990","MEANpct1619notinschool2000","MEANpct1619notinschool2010","MEANpct1619notinschool2015","Citypctnonwhite1990","Citypctnonwhite2000","Citypctnonwhite2010","Citypctnonwhite2015","MEANCitypctnonwhite1990","MEANCitypctnonwhite2000","MEANCitypctnonwhite2010","MEANCitypctnonwhite2015","hogap1990","hogap2000","hogap2010","hogap2015","MEANhogap1990","MEANhogap2000","MEANhogap2010","MEANhogap2015","povgap1990","povgap2000","povgap2010","povgap2015","MEANpovgap1990","MEANpovgap2000","MEANpovgap2010","MEANpovgap2015","racialeducationgap1990","racialeducationgap2000","racialeducationgap2010","racialeducationgap2015","MEANracialeducationgap1990","MEANracialeducationgap2000","MEANracialeducationgap2010","MEANracialeducationgap2015"]

cw.writerow(include)
for row in cr:
	outRow = []
	for ind in include:
		outRow.append(row[h[ind]])
	cw.writerow(outRow)
