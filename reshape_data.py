import csv
import xlrd

sourceXLSX = xlrd.open_workbook('data/source/WCCCities_12_6_19.xlsx')
sourceSheet = sourceXLSX.sheet_by_index(0)
sourceCSV = open('data/source/source.csv', 'wb')
sourceWriter = csv.writer(sourceCSV, quoting=csv.QUOTE_ALL)

for rowNum in xrange(sourceSheet.nrows):
    sourceWriter.writerow(sourceSheet.row_values(rowNum))

sourceCSV.close()

sourceReader = csv.reader(open("data/source/source.csv", "rU"))
dataWriter = csv.writer(open("data/data.csv","wb"))

head = sourceReader.next()
h = {}
i = 0
for e in head:
	h[e] = i
	i += 1

include = ["TablePlace","stateabrev","rankeconhealth1990","rankeconinclusionindex1990","rankraceinclusionindex1990","rankoverallinclusionindex1990","rankeconhealth2000","rankeconinclusionindex2000","rankraceinclusionindex2000","rankoverallinclusionindex2000","rankeconhealth2010","rankeconinclusionindex2010","rankraceinclusionindex2010","rankoverallinclusionindex2010","rankeconhealth2015","rankeconinclusionindex2015","rankraceinclusionindex2015","rankoverallinclusionindex2015","pop1990","pop2000","pop2010","pop2015","unemprate1990","MEANunemprate1990","unemprate2000","MEANunemprate2000","unemprate2010","lower_unemprate2010","upper_unemprate2010","MEANunemprate2010","unemprate2015","lower_unemprate2015","upper_unemprate2015","MEANunemprate2015","vacancyrate1990","MEANvacancyrate1990","vacancyrate2000","MEANvacancyrate2000","vacancyrate2010","lower_vacancyrate2010","upper_vacancyrate2010","MEANvacancyrate2010","vacancyrate2015","lower_vacancyrate2015","upper_vacancyrate2015","MEANvacancyrate2015","medfamincome1990","MEANmedfamincome1990","medfamincome2000","MEANmedfamincome2000","medfamincome2010","MEANmedfamincome2010","medfamincome2015","MEANmedfamincome2015","lower_medfamincome2015","lower_medfamincome2010","upper_medfamincome2015","upper_medfamincome2010","Citypctnonwhite1990","MEANCitypctnonwhite1990","Citypctnonwhite2000","MEANCitypctnonwhite2000","Citypctnonwhite2010","lower_Citypctnonwhite2010","upper_Citypctnonwhite2010","MEANCitypctnonwhite2010","Citypctnonwhite2015","lower_Citypctnonwhite2015","upper_Citypctnonwhite2015","MEANCitypctnonwhite2015","hogap1990","MEANhogap1990","hogap2000","MEANhogap2000","hogap2010","lower_hogap2010","upper_hogap2010","MEANhogap2010","hogap2015","lower_hogap2015","upper_hogap2015","MEANhogap2015","povgap1990","MEANpovgap1990","povgap2000","MEANpovgap2000","povgap2010","lower_povgap2010","upper_povgap2010","MEANpovgap2010","povgap2015","lower_povgap2015","upper_povgap2015","MEANpovgap2015","racialeducationgap1990","MEANracialeducationgap1990","racialeducationgap2000","MEANracialeducationgap2000","racialeducationgap2010","lower_racialeducationgap2010","upper_racialeducationgap2010","MEANracialeducationgap2010","racialeducationgap2015","lower_racialeducationgap2015","upper_racialeducationgap2015","MEANracialeducationgap2015","rentburden1990","MEANrentburden1990","rentburden2000","MEANrentburden2000","rentburden2010","lower_rentburden2010","upper_rentburden2010","MEANrentburden2010","rentburden2015","lower_rentburden2015","upper_rentburden2015","MEANrentburden2015","workingpoor1990","MEANworkingpoor1990","workingpoor2000","MEANworkingpoor2000","workingpoor2010","lower_workingpoor2010","upper_workingpoor2010","MEANworkingpoor2010","workingpoor2015","lower_workingpoor2015","upper_workingpoor2015","MEANworkingpoor2015","pct1619notinschool1990","MEANpct1619notinschool1990","pct1619notinschool2000","MEANpct1619notinschool2000","pct1619notinschool2010","lower_pct1619notinschool2010","upper_pct1619notinschool2010","MEANpct1619notinschool2010","pct1619notinschool2015","lower_pct1619notinschool2015","upper_pct1619notinschool2015","MEANpct1619notinschool2015"]

dataWriter.writerow(include)
for row in sourceReader:
	outRow = []
	for ind in include:
		outRow.append(row[h[ind]])
	dataWriter.writerow(outRow)

