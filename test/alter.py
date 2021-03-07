import pandas as pd
import numpy as np

df = pd.read_csv("./old_data/run_2belts.csv")
df['Copx1'] = df['My1'] / df['Fz1']
df['Copy1'] = df['Mx1'] / df['Fz1']
df['Copxy1'] = np.sqrt(df['Copx1']** 2 + df['Copy1']** 2)
df['Copx2'] = df['My2'] / df['Fz2']
df['Copy2'] = df['Mx2'] / df['Fz2']
df['Copxy2'] = np.sqrt(df['Copx2']** 2 + df['Copy2']** 2)
df.to_csv("./data/run_2belts.csv",index=False)
print(df)
