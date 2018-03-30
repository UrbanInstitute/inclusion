import csv

cr = csv.reader(open("data/source/source.csv", "rU"))
cw = csv.writer(open("data/data.csv","wb"))

head = cr.next()
h = {}
i = 0
for e in head:
	h[e] = i
	i += 1

include = ["place","stateabrev","rankeconhealth1980","rankeconinclusionindex1980","rankraceinclusionindex1980","rankoverallinclusionindex1980","rankeconhealth1990","rankeconinclusionindex1990","rankraceinclusionindex1990","rankoverallinclusionindex1990","rankeconhealth2000","rankeconinclusionindex2000","rankraceinclusionindex2000","rankoverallinclusionindex2000","rankeconhealth2013","rankeconinclusionindex2013","rankraceinclusionindex2013","rankoverallinclusionindex2013","pop1980","pop1990","pop2000","everrecover","lat","lon","recovperiod","pop2013","consolidated","pctemploymentchange1980","pctemploymentchange1990","pctemploymentchange2000","pctemploymentchange2013","MEANpctemploymentchange1980","MEANpctemploymentchange1990","MEANpctemploymentchange2000","MEANpctemploymentchange2013","unemprate1980","unemprate1990","unemprate2000","unemprate2013","MEANunemprate1980","MEANunemprate1990","MEANunemprate2000","MEANunemprate2013","vacancyrate1980","vacancyrate1990","vacancyrate2000","vacancyrate2013","MEANvacancyrate1980","MEANvacancyrate1990","MEANvacancyrate2000","MEANvacancyrate2013","medfamincome1980","medfamincome1990","medfamincome2000","medfamincome2013","MEANmedfamincome1980","MEANmedfamincome1990","MEANmedfamincome2000","MEANmedfamincome2013","incseg1980","incseg1990","incseg2000","incseg2013","MEANincseg1980","MEANincseg1990","MEANincseg2000","MEANincseg2013","rentburden1980","rentburden1990","rentburden2000","rentburden2013","MEANrentburden1980","MEANrentburden1990","MEANrentburden2000","MEANrentburden2013","workingpoor1980","workingpoor1990","workingpoor2000","workingpoor2013","MEANworkingpoor1980","MEANworkingpoor1990","MEANworkingpoor2000","MEANworkingpoor2013","pct1619notinschool1980","pct1619notinschool1990","pct1619notinschool2000","pct1619notinschool2013","MEANpct1619notinschool1980","MEANpct1619notinschool1990","MEANpct1619notinschool2000","MEANpct1619notinschool2013","Citypctnonwhite1980","Citypctnonwhite1990","Citypctnonwhite2000","Citypctnonwhite2013","MEANCitypctnonwhite1980","MEANCitypctnonwhite1990","MEANCitypctnonwhite2000","MEANCitypctnonwhite2013","RacialSeg1980","RacialSeg1990","RacialSeg2000","RacialSeg2013","MEANRacialSeg1980","MEANRacialSeg1990","MEANRacialSeg2000","MEANRacialSeg2013","hogap1980","hogap1990","hogap2000","hogap2013","MEANhogap1980","MEANhogap1990","MEANhogap2000","MEANhogap2013","povgap1980","povgap1990","povgap2000","povgap2013","MEANpovgap1980","MEANpovgap1990","MEANpovgap2000","MEANpovgap2013","racialeducationgap1980","racialeducationgap1990","racialeducationgap2000","racialeducationgap2013","MEANracialeducationgap1980","MEANracialeducationgap1990","MEANracialeducationgap2000","MEANracialeducationgap2013"]

cw.writerow(include)
for row in cr:
	outRow = []
	for ind in include:
		outRow.append(row[h[ind]])
	cw.writerow(outRow)
