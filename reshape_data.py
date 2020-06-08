### This script uses python 2
import csv

cr = csv.reader(open("data/source/measuringinclusion_ranks_and_indices.csv", "rU"))
cw = csv.writer(open("data/data.csv","wb"))

head = cr.next()
h = {}
i = 0
for e in head:
	h[e] = i
	i += 1

include = ["place","stateabrev",
            #"rankeconhealth1980",
            "rankeconinclusionindex1980","rankraceinclusionindex1980","rankoverallinclusionindex1980",
            #"rankeconhealth1990",
            "rankeconinclusionindex1990","rankraceinclusionindex1990","rankoverallinclusionindex1990",
            #"rankeconhealth2000",
            "rankeconinclusionindex2000","rankraceinclusionindex2000","rankoverallinclusionindex2000",
            #"rankeconhealth2013",
            "rankeconinclusionindex2013","rankraceinclusionindex2013","rankoverallinclusionindex2013",
            #"rankeconhealth2016",
            "rankeconinclusionindex2016","rankraceinclusionindex2016","rankoverallinclusionindex2016",
            "pop1980","pop1990","pop2000",
            #"everrecover",
            "Lat","Long",
            #"recovperiod",
            "pop2013","pop2016",
            "consolidated",
            "pctemploymentchange1980","pctemploymentchange1990","pctemploymentchange2000","pctemploymentchange2013","pctemploymentchange2016",
            "MEANpctemploymentchange1980","MEANpctemploymentchange1990","MEANpctemploymentchange2000","MEANpctemploymentchange2013","MEANpctemploymentchange2016",
            "unemprate1980","unemprate1990","unemprate2000","unemprate2013","unemprate2016",
            "MEANunemprate1980","MEANunemprate1990","MEANunemprate2000","MEANunemprate2013","MEANunemprate2016",
            "vacancyrate1980","vacancyrate1990","vacancyrate2000","vacancyrate2013","vacancyrate2016",
            "MEANvacancyrate1980","MEANvacancyrate1990","MEANvacancyrate2000","MEANvacancyrate2013","MEANvacancyrate2016",
            "medfamincome1980","medfamincome1990","medfamincome2000","medfamincome2013","medfamincome2016",
            "MEANmedfamincome1980","MEANmedfamincome1990","MEANmedfamincome2000","MEANmedfamincome2013","MEANmedfamincome2016",
            "incseg1980","incseg1990","incseg2000","incseg2013","incseg2016",
            "MEANincseg1980","MEANincseg1990","MEANincseg2000","MEANincseg2013","MEANincseg2016",
            "rentburden1980","rentburden1990","rentburden2000","rentburden2013","rentburden2016",
            "MEANrentburden1980","MEANrentburden1990","MEANrentburden2000","MEANrentburden2013","MEANrentburden2016",
            "workingpoor1980","workingpoor1990","workingpoor2000","workingpoor2013","workingpoor2016",
            "MEANworkingpoor1980","MEANworkingpoor1990","MEANworkingpoor2000","MEANworkingpoor2013","MEANworkingpoor2016",
            "pct1619notinschool1980","pct1619notinschool1990","pct1619notinschool2000","pct1619notinschool2013","pct1619notinschool2016",
            "MEANpct1619notinschool1980","MEANpct1619notinschool1990","MEANpct1619notinschool2000","MEANpct1619notinschool2013","MEANpct1619notinschool2016",
            "Citypctnonwhite1980","Citypctnonwhite1990","Citypctnonwhite2000","Citypctnonwhite2013","Citypctnonwhite2016",
            "MEANCitypctnonwhite1980","MEANCitypctnonwhite1990","MEANCitypctnonwhite2000","MEANCitypctnonwhite2013","MEANCitypctnonwhite2016",
            "RacialSeg1980","RacialSeg1990","RacialSeg2000","RacialSeg2013","RacialSeg2016",
            "MEANRacialSeg1980","MEANRacialSeg1990","MEANRacialSeg2000","MEANRacialSeg2013","MEANRacialSeg2016",
            "hogap1980","hogap1990","hogap2000","hogap2013","hogap2016",
            "MEANhogap1980","MEANhogap1990","MEANhogap2000","MEANhogap2013","MEANhogap2016",
            "povgap1980","povgap1990","povgap2000","povgap2013","povgap2016",
            "MEANpovgap1980","MEANpovgap1990","MEANpovgap2000","MEANpovgap2013","MEANpovgap2016",
            "racialeducationgap1980","racialeducationgap1990","racialeducationgap2000","racialeducationgap2013","racialeducationgap2016",
            "MEANracialeducationgap1980","MEANracialeducationgap1990","MEANracialeducationgap2000","MEANracialeducationgap2013","MEANracialeducationgap2016"]

cw.writerow(include)
for row in cr:
	outRow = []
	for ind in include:
		outRow.append(row[h[ind]])
	cw.writerow(outRow)
